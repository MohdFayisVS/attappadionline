import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { requireAdmin } from "./middleware/requireAdmin";
import { requiresAdmin } from "./middleware/routePolicy";
const __dirname = process.cwd();

// Firebase is imported dynamically inside database operations to optimize serverless cold starts

// Load environment variables
dotenv.config();

const app = express();

// Express 4 does not automatically forward rejected async handlers to error middleware.
// Wrap route registration so failures reach the centralized API error handler.
for (const method of ["get", "post", "put", "patch", "delete", "all"] as const) {
  const original = app[method].bind(app);
  (app as any)[method] = (route: string, ...handlers: any[]) => original(route, ...handlers.map((handler: any) =>
    typeof handler === "function"
      ? (req: express.Request, res: express.Response, next: express.NextFunction) => {
          try { Promise.resolve(handler(req, res, next)).catch(next); } catch (error) { next(error); }
        }
      : handler
  ));
}

const PORT = 3000;

// URL Rewrite Middleware for Vercel Serverless routing compat
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Vercel edge router rewrites the request URL path to /api/index.ts.
  // We restore the original path from the matched path header so Express can route correctly.
  const matchedPath = req.headers["x-matched-path"] || req.headers["x-vercel-matched-path"];
  if (matchedPath && typeof matchedPath === "string") {
    req.url = matchedPath;
  }

  if (process.env.VERCEL && req.url && !req.url.startsWith("/api")) {
    req.url = "/api" + req.url;
  }
  next();
});

// Lazy Firestore database loader helper for Serverless Environments
let isDbInitialized = false;
let dbInitPromise: Promise<void> | null = null;

async function ensureDbInitialized() {
  if (isDbInitialized) return;
  if (!dbInitPromise) {
    dbInitPromise = initFirestoreDatabase().then(() => {
      isDbInitialized = true;
    }).catch(err => {
      dbInitPromise = null; // reset to retry on next request
      throw err;
    });
  }
  return dbInitPromise;
}

// On-demand database synchronization middleware
app.use(async (req, res, next) => {
  const isAuthOrDebugRoute = req.path === "/api/admin/login" || 
                             req.path === "/admin/login" || 
                             req.path === "/api/debug-route-details" ||
                             req.path.includes("debug");
  
  if (isAuthOrDebugRoute) {
    return next();
  }

  try {
    await ensureDbInitialized();
  } catch (err) {
    console.error("❌ Lazy database synchronization failed:", err);
  }
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

let DB_PATH = path.join(__dirname, "db.json");
if (process.env.VERCEL) {
  DB_PATH = path.join("/tmp", "db.json");
}
// ==================== DEFAULT SEED ARRAYS ====================
const defaultDestinations: any[] = [];
const defaultCultures: any[] = [];
const defaultStays: any[] = [];
const defaultTravelogues: any[] = [];
const defaultPhotos: any[] = [];
const defaultBusRoutes: any[] = [];
const defaultRoutes: any[] = [];
const defaultAutos: any[] = [];
const defaultEmergencies: any[] = [];
const defaultNotices: any[] = [];
const defaultLpgDeliveries: any[] = [];

const defaultAdConfig = {
  leftAd: {
    titleEn: "Contact for Ads",
    titleMl: "പരസ്യങ്ങൾക്ക് ബന്ധപ്പെടുക",
    subtitleEn: "Enquire Now",
    subtitleMl: "വിശദവിവരങ്ങൾക്ക്",
    contact: "+91 9447471224",
    actionType: "share",
    externalUrl: "",
    image: ""
  },
  rightAd: {
    titleEn: "Attappadi Online Ads",
    titleMl: "പരസ്യങ്ങൾക്ക് വിളിക്കുക",
    subtitleEn: "Contact: +91 9447471224",
    subtitleMl: "ബന്ധപ്പെടുക: +91 9447471224",
    contact: "+91 9447471224",
    actionType: "phone",
    externalUrl: "",
    image: ""
  }
};

// ==================== END DEFAULT SEEDS ====================

// ==================== FIRESTORE INTEGRATION ====================
const CONFIG_PATH = path.join(__dirname, "firebase-applet-config.json");
let firestoreDb: any = null;

// Firestore will be initialized dynamically on first query inside initFirestoreDatabase()



// Initial database structure
let database: any = { 
  news: [], 
  events: [], 
  directory: [], 
  emergency: [], 
  opinions: [], 
  destinations: [], 
  cultures: [], 
  stays: [], 
  travelogues: [], 
  photos: [], 
  busRoutes: [],
  routes: [],
  notices: [],
  lpgDeliveries: [],
  autos: [],
  adConfig: defaultAdConfig
};

// Purely local fallback loader (for startup safety and offline configuration)
function loadDatabase() {
  try {
    let db: any = { 
      news: [], 
      events: [], 
      directory: [], 
      emergency: [], 
      opinions: [], 
      destinations: [], 
      cultures: [], 
      stays: [], 
      travelogues: [], 
      photos: [], 
      busRoutes: [],
      routes: [],
      notices: [],
      lpgDeliveries: [],
      lostFound: [],
      autos: [],
      adConfig: defaultAdConfig
    };
    
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, "utf-8");
      db = { ...db, ...JSON.parse(data) };
    }
    
    if (!db.autos) db.autos = [];
    if (!db.destinations) db.destinations = [];
    if (!db.cultures) db.cultures = [];
    if (!db.stays) db.stays = [];
    if (!db.travelogues) db.travelogues = [];
    if (!db.photos) db.photos = [];
    if (!db.busRoutes) db.busRoutes = [];
    if (!db.routes) db.routes = [];
    if (!db.emergency) db.emergency = [];
    if (!db.notices) db.notices = [];
    if (!db.lpgDeliveries) db.lpgDeliveries = [];
    if (!db.adConfig) db.adConfig = defaultAdConfig;

    return db;
  } catch (err) {
    console.error("Database reading error, returning defaults:", err);
    return { 
      news: [], 
      events: [], 
      directory: [], 
      emergency: [], 
      opinions: [], 
      destinations: [], 
      cultures: [], 
      stays: [], 
      travelogues: [], 
      photos: [], 
      busRoutes: [],
      routes: [],
      notices: [],
      lpgDeliveries: [],
      lostFound: [],
      adConfig: defaultAdConfig
    };
  }
}



// Synchronizes and loads everything on server startup
async function initFirestoreDatabase() {
  const fallbackLocalDb = loadDatabase();

  if (!firestoreDb) {
    try {
      const { getServerFirestore } = await import("./serverFirestore");
      firestoreDb = getServerFirestore();
      console.log("Firebase Admin Firestore initialized");
    } catch (error) {
      console.error("Firebase Admin Firestore initialization failed:", error);
    }
  }

  if (!firestoreDb) {
    console.warn("Firestore not initialized. Loading local data.");
    database = fallbackLocalDb || loadDatabase();
    return;
  }

  const { collection, getDocs, doc, setDoc, getDoc } = await import("./serverFirestore");

  console.log("⚡ Fetching and synchronizing Firestore data...");
  const collections = [
    { col: "news", defaultSeed: [] },
    { col: "opinions", defaultSeed: [] },
    { col: "events", defaultSeed: [] },
    { col: "directory", defaultSeed: [] },
    { col: "emergency", defaultSeed: [] },
    { col: "notices", defaultSeed: [] },
    { col: "lpgDeliveries", defaultSeed: [] },
    { col: "autos", defaultSeed: [] },
    { col: "destinations", defaultSeed: [] },
    { col: "cultures", defaultSeed: [] },
    { col: "stays", defaultSeed: [] },
    { col: "travelogues", defaultSeed: [] },
    { col: "photos", defaultSeed: [] },
    { col: "busRoutes", defaultSeed: [] },
    { col: "routes", defaultSeed: [] },
    { col: "lostFound", defaultSeed: [] }
  ];

  await Promise.all(collections.map(async (entry) => {
    const key = entry.col;
    try {
      const qSnap = await getDocs(collection(firestoreDb, entry.col));
      const items: any[] = [];
      qSnap.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });

      if (items.length === 0 && entry.defaultSeed.length > 0) {
        console.log(`🌱 Firestore collection [${entry.col}] is empty. Seeding ${entry.defaultSeed.length} defaults...`);
        for (const seedItem of entry.defaultSeed) {
          const docId = seedItem.id || `seed_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
          const cleanItem = { ...seedItem };
          delete cleanItem.id;
          await setDoc(doc(firestoreDb, entry.col, docId), cleanItem);
          items.push({ id: docId, ...cleanItem });
        }
      }

      database[key] = items;
      console.log(`✅ Loaded ${items.length} items for [${key}]`);
    } catch (e) {
      console.error(`❌ Firestore boot/seed error for [${entry.col}], falling back to local file database:`, e);
      if (fallbackLocalDb && Array.isArray(fallbackLocalDb[key]) && fallbackLocalDb[key].length > 0) {
        database[key] = fallbackLocalDb[key];
        console.log(`ℹ️ Recovered ${fallbackLocalDb[key].length} items from local backup for [${key}]`);
      } else {
        database[key] = entry.defaultSeed;
      }
    }
  }));

  // Load adConfig from metadata collection
  try {
    const configSnap = await getDoc(doc(firestoreDb, "metadata", "adConfig"));
    if (configSnap.exists) {
      database.adConfig = configSnap.data();
      console.log("✅ Loaded adConfig from metadata/adConfig");
    } else {
      console.log("🌱 Firestore metadata/adConfig empty. Seeding default adConfig...");
      await setDoc(doc(firestoreDb, "metadata", "adConfig"), defaultAdConfig);
      database.adConfig = defaultAdConfig;
    }
  } catch (e) {
    console.error("❌ Firestore load error for metadata/adConfig, falling back to local adConfig:", e);
    database.adConfig = (fallbackLocalDb && fallbackLocalDb.adConfig) ? fallbackLocalDb.adConfig : defaultAdConfig;
  }

  // Keep a local backup of what was loaded
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(database, null, 2), "utf-8");
  } catch (err) {
    console.error("Backup writing failed:", err);
  }

  // No destructive data cleanup is permitted during API initialization.
}

// Helper to save database safely
function saveDatabase(data: any) {
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("⚠️ Local JSON backup write skipped (likely read-only serverless environment):", err);
  }
  return true;
}

// Real-time Firestore helper: Fetch a collection directly from firestore, falling back to local database memory
async function getCollectionData(colName: string): Promise<any[]> {
  if (!firestoreDb) {
    return database[colName] || [];
  }
  const { collection, getDocs } = await import("./serverFirestore");
  try {
    const qSnap = await getDocs(collection(firestoreDb, colName));
    const items: any[] = [];
    qSnap.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() });
    });
    // Sync to local memory cache so local fallbacks are kept up to date
    database[colName] = items;
    return items;
  } catch (err) {
    console.error(`❌ Firestore direct read failed for [${colName}]:`, err);
    return database[colName] || [];
  }
}

// Real-time Firestore helper: Save or update a single document directly in firestore
async function writeItemToFirestore(colName: string, id: string, item: any): Promise<void> {
  if (!firestoreDb) throw new Error("Firestore unavailable: refusing to acknowledge an unpersisted mutation.");
  const { doc, setDoc } = await import("./serverFirestore");
  try {
    const cleanItem = { ...item };
    delete cleanItem.id;
    const writePromise = setDoc(doc(firestoreDb, colName, id), cleanItem);
    await writePromise;
    console.log(`[Firestore Direct Write] Saved [${colName}] / [${id}]`);
  } catch (err) {
    console.error(`❌ Firestore direct write failed for [${colName}] / [${id}]:`, err);
    throw err;
  }
}

// Real-time Firestore helper: Delete a single document directly in firestore
async function deleteItemFromFirestore(colName: string, id: string): Promise<void> {
  if (!firestoreDb) throw new Error("Firestore unavailable: refusing to acknowledge an unpersisted mutation.");
  const { doc, deleteDoc } = await import("./serverFirestore");
  try {
    const deletePromise = deleteDoc(doc(firestoreDb, colName, id));
    await deletePromise;
    console.log(`[Firestore Direct Delete] Deleted [${colName}] / [${id}]`);
  } catch (err) {
    console.error(`❌ Firestore direct delete failed for [${colName}] / [${id}]:`, err);
    throw err;
  }
}

// Privileged routes: fail closed before any admin read or content mutation.
// Public interactions (article view counters and lost/found submission)
// remain accessible; they require separate abuse-prevention controls.
app.use("/api", (req, res, next) => {
  if (requiresAdmin(req.method, req.path)) return requireAdmin(req, res, next);
  next();
});

// API ENDPOINTS

// 1. Admin Authentication Check
// Legacy password authentication is retired. Clients must use Firebase Auth ID tokens.
app.post("/api/admin/login", (_req, res) => {
  res.status(410).json({ error: "Legacy login disabled. Use Firebase Authentication." });
});

// 1b. Database Diagnostic Endpoint
app.get("/api/admin/db-diagnostic", async (req, res) => {
  const { collection, getDocs } = await import("./serverFirestore");
  let isUsingFirestore = !!firestoreDb;
  let status = "disconnected";
  let errorMessage = null;

  const collectionsInfo = {
    news: { localCount: (database.news || []).length, firestoreCount: 0, status: "idle", error: null as string | null },
    events: { localCount: (database.events || []).length, firestoreCount: 0, status: "idle", error: null as string | null },
    notices: { localCount: (database.notices || []).length, firestoreCount: 0, status: "idle", error: null as string | null },
  };

  if (firestoreDb) {
    status = "connected";
    
    // Check News
    try {
      const qSnap = await getDocs(collection(firestoreDb, "news"));
      collectionsInfo.news.firestoreCount = qSnap.size;
      collectionsInfo.news.status = qSnap.size > 0 ? "healthy" : "warning_empty";
    } catch (err: any) {
      collectionsInfo.news.status = "error";
      collectionsInfo.news.error = err.message || String(err);
      status = "error";
      errorMessage = err.message || String(err);
    }

    // Check Events
    try {
      const qSnap = await getDocs(collection(firestoreDb, "events"));
      collectionsInfo.events.firestoreCount = qSnap.size;
      collectionsInfo.events.status = qSnap.size > 0 ? "healthy" : "warning_empty";
    } catch (err: any) {
      collectionsInfo.events.status = "error";
      collectionsInfo.events.error = err.message || String(err);
    }

    // Check Notices
    try {
      const qSnap = await getDocs(collection(firestoreDb, "notices"));
      collectionsInfo.notices.firestoreCount = qSnap.size;
      collectionsInfo.notices.status = qSnap.size > 0 ? "healthy" : "warning_empty";
    } catch (err: any) {
      collectionsInfo.notices.status = "error";
      collectionsInfo.notices.error = err.message || String(err);
    }
  } else {
    collectionsInfo.news.status = "local";
    collectionsInfo.events.status = "local";
    collectionsInfo.notices.status = "local";
  }

  res.json({
    status,
    isUsingFirestore,
    databaseId: firestoreDb ? "ai-studio-b11a32d4-4bb4-40fb-b67d-2be1f2d002c6" : "none",
    collections: collectionsInfo,
    errorMessage
  });
});

// 2. News CRUD
app.get("/api/news", async (req, res) => {
  const data = await getCollectionData("news");
  res.json(data);
});

app.post("/api/news", async (req, res) => {
  const { titleEn, titleMl, contentEn, contentMl, category, regions, image, isSlide, isCard } = req.body;
  if (!titleEn || !titleMl || !contentEn || !contentMl || !category) {
    return res.status(400).json({ error: "Missing required fields for news publishing" });
  }

  const newPost = {
    id: "news_" + Date.now().toString(),
    titleEn,
    titleMl,
    contentEn,
    contentMl,
    category,
    regions: regions || [],
    image: image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=60",
    publishedAt: new Date().toISOString(),
    views: 1,
    isSlide: !!isSlide,
    isCard: !!isCard
  };

  try {
    await writeItemToFirestore("news", newPost.id, newPost);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.news = [newPost, ...(database.news || [])];
  saveDatabase(database);
  res.status(201).json(newPost);
});

app.put("/api/news/:id", async (req, res) => {
  const { id } = req.params;
  const { titleEn, titleMl, contentEn, contentMl, category, regions, image, isSlide, isCard } = req.body;
  
  const newsList = await getCollectionData("news");
  const itemIndex = newsList.findIndex((item: any) => item.id === id);

  if (itemIndex !== -1) {
    const updatedPost = {
      ...newsList[itemIndex],
      titleEn: titleEn !== undefined ? titleEn : newsList[itemIndex].titleEn,
      titleMl: titleMl !== undefined ? titleMl : newsList[itemIndex].titleMl,
      contentEn: contentEn !== undefined ? contentEn : newsList[itemIndex].contentEn,
      contentMl: contentMl !== undefined ? contentMl : newsList[itemIndex].contentMl,
      category: category !== undefined ? category : newsList[itemIndex].category,
      regions: regions !== undefined ? regions : newsList[itemIndex].regions,
      image: image !== undefined ? image : newsList[itemIndex].image,
      isSlide: isSlide !== undefined ? !!isSlide : newsList[itemIndex].isSlide,
      isCard: isCard !== undefined ? !!isCard : newsList[itemIndex].isCard
    };

    try {
      await writeItemToFirestore("news", id, updatedPost);
    } catch {
      return res.status(503).json({ error: "Unable to persist news update" });
    }
    database.news = (database.news || []).map((item: any) => item.id === id ? updatedPost : item);
    saveDatabase(database);
    res.json({ success: true, id });
  } else {
    res.status(404).json({ error: "News item not found" });
  }
});

app.delete("/api/news/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await deleteItemFromFirestore("news", id);
  } catch {
    return res.status(503).json({ error: "Unable to delete news item" });
  }
  database.news = (database.news || []).filter((item: any) => item.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

app.get("/api/adconfig", async (req, res) => {
  if (!firestoreDb) {
    return res.json(database.adConfig || defaultAdConfig);
  }
  const { doc, getDoc } = await import("./serverFirestore");
  try {
    const configSnap = await getDoc(doc(firestoreDb, "metadata", "adConfig"));
    if (configSnap.exists) {
      database.adConfig = configSnap.data();
      return res.json(database.adConfig);
    }
  } catch (err) {
    console.error("❌ Failed to fetch adConfig directly:", err);
  }
  res.json(database.adConfig || defaultAdConfig);
});

app.put("/api/adconfig", async (req, res) => {
  const { leftAd, rightAd } = req.body;
  
  if (!leftAd || !rightAd) {
    return res.status(400).json({ error: "Missing leftAd or rightAd setup parameters" });
  }

  const updatedConfig = {
    leftAd: {
      titleEn: leftAd.titleEn || "",
      titleMl: leftAd.titleMl || "",
      subtitleEn: leftAd.subtitleEn || "",
      subtitleMl: leftAd.subtitleMl || "",
      contact: leftAd.contact || "",
      actionType: leftAd.actionType || "share",
      externalUrl: leftAd.externalUrl || "",
      image: leftAd.image || ""
    },
    rightAd: {
      titleEn: rightAd.titleEn || "",
      titleMl: rightAd.titleMl || "",
      subtitleEn: rightAd.subtitleEn || "",
      subtitleMl: rightAd.subtitleMl || "",
      contact: rightAd.contact || "",
      actionType: rightAd.actionType || "phone",
      externalUrl: rightAd.externalUrl || "",
      image: rightAd.image || ""
    }
  };

  if (firestoreDb) {
    const { doc, setDoc } = await import("./serverFirestore");
    try {
      const writePromise = setDoc(doc(firestoreDb, "metadata", "adConfig"), updatedConfig);
        await writePromise;
      console.log("[Firestore Direct Write] Saved metadata/adConfig");
    } catch (err) {
      console.error("❌ Firestore direct write failed for metadata/adConfig:", err);
      return res.status(503).json({ error: "Unable to save advertising configuration" });
    }
  }

  database.adConfig = updatedConfig;
  saveDatabase(database);
  res.json({ success: true, adConfig: updatedConfig });
});

app.post("/api/news/:id/view", async (req, res) => {
  const { id } = req.params;
  const newsList = await getCollectionData("news");
  const itemIndex = newsList.findIndex((item: any) => item.id === id);
  if (itemIndex !== -1) {
    const updatedPost = {
      ...newsList[itemIndex],
      views: (newsList[itemIndex].views || 0) + 1
    };
    try {
      await writeItemToFirestore("news", id, updatedPost);
    } catch (error) {
      console.error("Firestore mutation failed:", error);
      return res.status(503).json({ error: "Database operation failed; no changes were saved." });
    }
    database.news = (database.news || []).map((item: any) => item.id === id ? updatedPost : item);
    saveDatabase(database);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "News not found" });
  }
});

// 3. User Opinion Board
app.get("/api/opinions", async (req, res) => {
  const data = await getCollectionData("opinions");
  res.json(data);
});

app.post("/api/opinions", async (req, res) => {
  const { authorName, titleEn, titleMl, contentEn, contentMl, approved } = req.body;
  if (!authorName || !titleEn || !contentEn) {
    return res.status(400).json({ error: "Missing author name, title, or opinion content." });
  }

  const newOpinion = {
    id: "opinion_" + Date.now().toString(),
    authorName,
    titleEn,
    titleMl: titleMl || titleEn,
    contentEn,
    contentMl: contentMl || contentEn,
    createdAt: new Date().toISOString(),
    approved: approved !== undefined ? !!approved : false
  };

  try {
    await writeItemToFirestore("opinions", newOpinion.id, newOpinion);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.opinions = [newOpinion, ...(database.opinions || [])];
  saveDatabase(database);
  res.status(201).json(newOpinion);
});

app.put("/api/opinions/:id", async (req, res) => {
  const { id } = req.params;
  const { authorName, titleEn, titleMl, contentEn, contentMl, approved } = req.body;
  
  const opinionsList = await getCollectionData("opinions");
  const itemIndex = opinionsList.findIndex((op: any) => op.id === id);

  if (itemIndex !== -1) {
    const updatedOpinion = {
      ...opinionsList[itemIndex],
      authorName: authorName !== undefined ? authorName : opinionsList[itemIndex].authorName,
      titleEn: titleEn !== undefined ? titleEn : opinionsList[itemIndex].titleEn,
      titleMl: titleMl !== undefined ? titleMl : opinionsList[itemIndex].titleMl,
      contentEn: contentEn !== undefined ? contentEn : opinionsList[itemIndex].contentEn,
      contentMl: contentMl !== undefined ? contentMl : opinionsList[itemIndex].contentMl,
      approved: approved !== undefined ? !!approved : opinionsList[itemIndex].approved
    };

    try {
      await writeItemToFirestore("opinions", id, updatedOpinion);
    } catch (error) {
      console.error("Firestore mutation failed:", error);
      return res.status(503).json({ error: "Database operation failed; no changes were saved." });
    }
    database.opinions = (database.opinions || []).map((op: any) => op.id === id ? updatedOpinion : op);
    saveDatabase(database);
    res.json({ success: true, id });
  } else {
    res.status(404).json({ error: "Opinion not found" });
  }
});

app.post("/api/opinions/approve/:id", async (req, res) => {
  const { id } = req.params;
  const opinionsList = await getCollectionData("opinions");
  const itemIndex = opinionsList.findIndex((op: any) => op.id === id);
  if (itemIndex !== -1) {
    const updatedOpinion = { ...opinionsList[itemIndex], approved: true };
    try {
      await writeItemToFirestore("opinions", id, updatedOpinion);
    } catch (error) {
      console.error("Firestore mutation failed:", error);
      return res.status(503).json({ error: "Database operation failed; no changes were saved." });
    }
    database.opinions = (database.opinions || []).map((op: any) => op.id === id ? updatedOpinion : op);
    saveDatabase(database);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Opinion not found" });
  }
});

app.post("/api/opinions/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await deleteItemFromFirestore("opinions", id);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.opinions = (database.opinions || []).filter((op: any) => op.id !== id);
  saveDatabase(database);
  res.json({ success: true });
});

// 4. Events Calendar
app.get("/api/events", async (req, res) => {
  const data = await getCollectionData("events");
  res.json(data);
});

app.post("/api/events", async (req, res) => {
  const { titleEn, titleMl, date, time, locationEn, locationMl, descriptionEn, descriptionMl } = req.body;
  if (!titleEn || !titleMl || !date || !locationEn || !locationMl) {
    return res.status(400).json({ error: "Missing required event fields" });
  }

  const newEvent = {
    id: "event_" + Date.now().toString(),
    titleEn,
    titleMl,
    date,
    time: time || "All Day",
    locationEn,
    locationMl,
    descriptionEn: descriptionEn || "",
    descriptionMl: descriptionMl || ""
  };

  try {
    await writeItemToFirestore("events", newEvent.id, newEvent);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.events = [newEvent, ...(database.events || [])];
  saveDatabase(database);
  res.status(201).json(newEvent);
});

app.put("/api/events/:id", async (req, res) => {
  const { id } = req.params;
  const { titleEn, titleMl, date, time, locationEn, locationMl, descriptionEn, descriptionMl } = req.body;
  
  const eventsList = await getCollectionData("events");
  const itemIndex = eventsList.findIndex((ev: any) => ev.id === id);

  if (itemIndex !== -1) {
    const updatedEvent = {
      ...eventsList[itemIndex],
      titleEn: titleEn !== undefined ? titleEn : eventsList[itemIndex].titleEn,
      titleMl: titleMl !== undefined ? titleMl : eventsList[itemIndex].titleMl,
      date: date !== undefined ? date : eventsList[itemIndex].date,
      time: time !== undefined ? time : eventsList[itemIndex].time,
      locationEn: locationEn !== undefined ? locationEn : eventsList[itemIndex].locationEn,
      locationMl: locationMl !== undefined ? locationMl : eventsList[itemIndex].locationMl,
      descriptionEn: descriptionEn !== undefined ? descriptionEn : eventsList[itemIndex].descriptionEn,
      descriptionMl: descriptionMl !== undefined ? descriptionMl : eventsList[itemIndex].descriptionMl
    };

    try {
      await writeItemToFirestore("events", id, updatedEvent);
    } catch (error) {
      console.error("Firestore mutation failed:", error);
      return res.status(503).json({ error: "Database operation failed; no changes were saved." });
    }
    database.events = (database.events || []).map((ev: any) => ev.id === id ? updatedEvent : ev);
    saveDatabase(database);
    res.json({ success: true, id });
  } else {
    res.status(404).json({ error: "Event not found" });
  }
});

app.delete("/api/events/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await deleteItemFromFirestore("events", id);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.events = (database.events || []).filter((ev: any) => ev.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// 5. Local Services Directory
app.get("/api/directory", async (req, res) => {
  const data = await getCollectionData("directory");
  res.json(data);
});

app.post("/api/directory", async (req, res) => {
  const { nameEn, nameMl, category, contact, locationEn, locationMl } = req.body;
  if (!nameEn || !nameMl || !category || !contact) {
    return res.status(400).json({ error: "Missing directory required fields" });
  }

  const newListing = {
    id: "dir_" + Date.now().toString(),
    nameEn,
    nameMl,
    category,
    contact,
    locationEn: locationEn || "Attappadi",
    locationMl: locationMl || "അട്ടപ്പാടി"
  };

  try {
    await writeItemToFirestore("directory", newListing.id, newListing);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.directory = [...(database.directory || []), newListing];
  saveDatabase(database);
  res.status(201).json(newListing);
});

app.put("/api/directory/:id", async (req, res) => {
  const { id } = req.params;
  const { nameEn, nameMl, category, contact, locationEn, locationMl } = req.body;
  
  const directoryList = await getCollectionData("directory");
  const itemIndex = directoryList.findIndex((item: any) => item.id === id);

  if (itemIndex !== -1) {
    const updatedListing = {
      ...directoryList[itemIndex],
      nameEn: nameEn !== undefined ? nameEn : directoryList[itemIndex].nameEn,
      nameMl: nameMl !== undefined ? nameMl : directoryList[itemIndex].nameMl,
      category: category !== undefined ? category : directoryList[itemIndex].category,
      contact: contact !== undefined ? contact : directoryList[itemIndex].contact,
      locationEn: locationEn !== undefined ? locationEn : directoryList[itemIndex].locationEn,
      locationMl: locationMl !== undefined ? locationMl : directoryList[itemIndex].locationMl
    };

    try {
      await writeItemToFirestore("directory", id, updatedListing);
    } catch (error) {
      console.error("Firestore mutation failed:", error);
      return res.status(503).json({ error: "Database operation failed; no changes were saved." });
    }
    database.directory = (database.directory || []).map((item: any) => item.id === id ? updatedListing : item);
    saveDatabase(database);
    res.json({ success: true, id });
  } else {
    res.status(404).json({ error: "Directory entry not found" });
  }
});

app.delete("/api/directory/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await deleteItemFromFirestore("directory", id);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.directory = (database.directory || []).filter((item: any) => item.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// 5b. Lost & Found Section
app.get("/api/lostfound", async (req, res) => {
  const data = await getCollectionData("lostFound");
  res.json(data);
});

app.post("/api/lostfound", async (req, res) => {
  const { type, itemTitleEn, itemTitleMl, descriptionEn, descriptionMl, reporterName, contactNumber, locationEn, locationMl } = req.body;
  if (!type || (!itemTitleEn && !itemTitleMl) || !reporterName || !contactNumber) {
    return res.status(400).json({ error: "Missing required fields for Lost & Found reporting" });
  }

  const finalTitleEn = itemTitleEn || itemTitleMl || "";
  const finalTitleMl = itemTitleMl || itemTitleEn || "";
  const finalDescEn = descriptionEn || descriptionMl || "";
  const finalDescMl = descriptionMl || descriptionEn || "";
  const finalLocEn = locationEn || locationMl || "Attappadi";
  const finalLocMl = locationMl || locationEn || "അട്ടപ്പാടി";

  const newItem = {
    id: "lf_" + Date.now().toString(),
    type, // "lost" | "found"
    itemTitleEn: finalTitleEn,
    itemTitleMl: finalTitleMl,
    descriptionEn: finalDescEn,
    descriptionMl: finalDescMl,
    reporterName,
    contactNumber,
    locationEn: finalLocEn,
    locationMl: finalLocMl,
    dateReported: new Date().toISOString(),
    status: "active"
  };

  try {
    await writeItemToFirestore("lostFound", newItem.id, newItem);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.lostFound = [...(database.lostFound || []), newItem];
  saveDatabase(database);
  res.status(201).json(newItem);
});

app.post("/api/lostfound/resolve/:id", async (req, res) => {
  const { id } = req.params;
  const { contactNumber } = req.body;

  if (!contactNumber) {
    return res.status(400).json({ error: "Contact number is required for verification" });
  }

  const lostFoundList = await getCollectionData("lostFound");
  const item = lostFoundList.find((i: any) => i.id === id);
  if (!item) {
    return res.status(404).json({ error: "Item not found" });
  }

  // Normalize numbers by removing non-digits
  const normInput = contactNumber.replace(/\D/g, "");
  const normContact = item.contactNumber.replace(/\D/g, "");

  if (normInput !== normContact) {
    return res.status(403).json({ error: "Verification contact number does not match" });
  }

  try {
    await deleteItemFromFirestore("lostFound", id);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.lostFound = (database.lostFound || []).filter((i: any) => i.id !== id);
  saveDatabase(database);
  res.json({ success: true, message: "Report resolved and removed successfully", id });
});

app.delete("/api/lostfound/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await deleteItemFromFirestore("lostFound", id);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.lostFound = (database.lostFound || []).filter((i: any) => i.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// 6. Emergency Contacts CRUD
app.get("/api/emergency", async (req, res) => {
  const data = await getCollectionData("emergency");
  res.json(data);
});

app.post("/api/emergency", async (req, res) => {
  const { nameEn, nameMl, number, type } = req.body;
  if (!nameEn || !nameMl || !number || !type) {
    return res.status(400).json({ error: "Missing required emergency fields" });
  }

  const newEmerg = {
    id: "em_" + Date.now().toString(),
    nameEn,
    nameMl,
    number,
    type
  };

  try {
    await writeItemToFirestore("emergency", newEmerg.id, newEmerg);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.emergency = [...(database.emergency || []), newEmerg];
  saveDatabase(database);
  res.status(201).json(newEmerg);
});

app.put("/api/emergency/:id", async (req, res) => {
  const { id } = req.params;
  const { nameEn, nameMl, number, type } = req.body;
  
  const emergencyList = await getCollectionData("emergency");
  const itemIndex = emergencyList.findIndex((em: any) => em.id === id);

  if (itemIndex !== -1) {
    const updatedEmerg = {
      ...emergencyList[itemIndex],
      nameEn: nameEn !== undefined ? nameEn : emergencyList[itemIndex].nameEn,
      nameMl: nameMl !== undefined ? nameMl : emergencyList[itemIndex].nameMl,
      number: number !== undefined ? number : emergencyList[itemIndex].number,
      type: type !== undefined ? type : emergencyList[itemIndex].type
    };

    try {
      await writeItemToFirestore("emergency", id, updatedEmerg);
    } catch (error) {
      console.error("Firestore mutation failed:", error);
      return res.status(503).json({ error: "Database operation failed; no changes were saved." });
    }
    database.emergency = (database.emergency || []).map((em: any) => em.id === id ? updatedEmerg : em);
    saveDatabase(database);
    res.json({ success: true, id });
  } else {
    res.status(404).json({ error: "Emergency contact not found" });
  }
});

app.delete("/api/emergency/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await deleteItemFromFirestore("emergency", id);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.emergency = (database.emergency || []).filter((em: any) => em.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// Notices CRUD Endpoints
app.get("/api/notices", async (req, res) => {
  const data = await getCollectionData("notices");
  res.json(data);
});

app.post("/api/notices", async (req, res) => {
  const { titleEn, titleMl, contentEn, contentMl, type, severity, date, active, image } = req.body;
  if (!noticesParamsCheck(req.body)) {
    return res.status(400).json({ error: "Missing required fields for Notice" });
  }

  const newNotice = {
    id: "not_" + Date.now().toString(),
    titleEn,
    titleMl,
    contentEn,
    contentMl,
    type: type || "notice",
    severity: severity || "medium",
    date: date || new Date().toISOString().split("T")[0],
    active: active !== undefined ? active : true,
    image: image || ""
  };

  try {
    await writeItemToFirestore("notices", newNotice.id, newNotice);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.notices = [...(database.notices || []), newNotice];
  saveDatabase(database);
  res.status(201).json(newNotice);
});

function noticesParamsCheck(body: any) {
  return body.titleEn && body.titleMl && body.contentEn && body.contentMl;
}

app.put("/api/notices/:id", async (req, res) => {
  const { id } = req.params;
  const { titleEn, titleMl, contentEn, contentMl, type, severity, date, active, image } = req.body;
  
  const noticesList = await getCollectionData("notices");
  const itemIndex = noticesList.findIndex((not: any) => not.id === id);

  if (itemIndex !== -1) {
    const updatedNotice = {
      ...noticesList[itemIndex],
      titleEn: titleEn !== undefined ? titleEn : noticesList[itemIndex].titleEn,
      titleMl: titleMl !== undefined ? titleMl : noticesList[itemIndex].titleMl,
      contentEn: contentEn !== undefined ? contentEn : noticesList[itemIndex].contentEn,
      contentMl: contentMl !== undefined ? contentMl : noticesList[itemIndex].contentMl,
      type: type !== undefined ? type : noticesList[itemIndex].type,
      severity: severity !== undefined ? severity : noticesList[itemIndex].severity,
      date: date !== undefined ? date : noticesList[itemIndex].date,
      active: active !== undefined ? active : noticesList[itemIndex].active,
      image: image !== undefined ? image : noticesList[itemIndex].image
    };

    try {
      await writeItemToFirestore("notices", id, updatedNotice);
    } catch (error) {
      console.error("Firestore mutation failed:", error);
      return res.status(503).json({ error: "Database operation failed; no changes were saved." });
    }
    database.notices = (database.notices || []).map((not: any) => not.id === id ? updatedNotice : not);
    saveDatabase(database);
    res.json({ success: true, id });
  } else {
    res.status(404).json({ error: "Notice not found" });
  }
});

app.delete("/api/notices/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await deleteItemFromFirestore("notices", id);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.notices = (database.notices || []).filter((not: any) => not.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// LPG Deliveries CRUD Endpoints
app.get("/api/lpg", async (req, res) => {
  const data = await getCollectionData("lpgDeliveries");
  res.json(data);
});

app.post("/api/lpg", async (req, res) => {
  const { agencyNameEn, agencyNameMl, areasEn, areasMl, date, statusEn, statusMl, contact, notesEn, notesMl } = req.body;
  if (!agencyNameEn || !agencyNameMl || !areasEn || !areasMl || !date || !contact) {
    return res.status(400).json({ error: "Missing required fields for LPG Delivery" });
  }

  const newLpg = {
    id: "lpg_" + Date.now().toString(),
    agencyNameEn,
    agencyNameMl,
    areasEn,
    areasMl,
    date,
    statusEn: statusEn || "Delivering Today",
    statusMl: statusMl || "ഇന്ന് വിതരണമുണ്ട്",
    contact,
    notesEn: notesEn || "",
    notesMl: notesMl || ""
  };

  try {
    await writeItemToFirestore("lpgDeliveries", newLpg.id, newLpg);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.lpgDeliveries = [...(database.lpgDeliveries || []), newLpg];
  saveDatabase(database);
  res.status(201).json(newLpg);
});

app.put("/api/lpg/:id", async (req, res) => {
  const { id } = req.params;
  const { agencyNameEn, agencyNameMl, areasEn, areasMl, date, statusEn, statusMl, contact, notesEn, notesMl } = req.body;
  
  const lpgList = await getCollectionData("lpgDeliveries");
  const itemIndex = lpgList.findIndex((lpg: any) => lpg.id === id);

  if (itemIndex !== -1) {
    const updatedLpg = {
      ...lpgList[itemIndex],
      agencyNameEn: agencyNameEn !== undefined ? agencyNameEn : lpgList[itemIndex].agencyNameEn,
      agencyNameMl: agencyNameMl !== undefined ? agencyNameMl : lpgList[itemIndex].agencyNameMl,
      areasEn: areasEn !== undefined ? areasEn : lpgList[itemIndex].areasEn,
      areasMl: areasMl !== undefined ? areasMl : lpgList[itemIndex].areasMl,
      date: date !== undefined ? date : lpgList[itemIndex].date,
      statusEn: statusEn !== undefined ? statusEn : lpgList[itemIndex].statusEn,
      statusMl: statusMl !== undefined ? statusMl : lpgList[itemIndex].statusMl,
      contact: contact !== undefined ? contact : lpgList[itemIndex].contact,
      notesEn: notesEn !== undefined ? notesEn : lpgList[itemIndex].notesEn,
      notesMl: notesMl !== undefined ? notesMl : lpgList[itemIndex].notesMl
    };

    try {
      await writeItemToFirestore("lpgDeliveries", id, updatedLpg);
    } catch (error) {
      console.error("Firestore mutation failed:", error);
      return res.status(503).json({ error: "Database operation failed; no changes were saved." });
    }
    database.lpgDeliveries = (database.lpgDeliveries || []).map((lpg: any) => lpg.id === id ? updatedLpg : lpg);
    saveDatabase(database);
    res.json({ success: true, id });
  } else {
    res.status(404).json({ error: "LPG delivery schedule not found" });
  }
});

app.delete("/api/lpg/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await deleteItemFromFirestore("lpgDeliveries", id);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.lpgDeliveries = (database.lpgDeliveries || []).filter((lpg: any) => lpg.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// Autorikshaw Taxi Service Endpoints
app.get("/api/autos", async (req, res) => {
  const data = await getCollectionData("autos");
  res.json(data);
});

app.post("/api/autos", async (req, res) => {
  const { driverNameEn, driverNameMl, autoNumber, contact, locationEn, locationMl, isAvailable } = req.body;
  if (!driverNameEn || !driverNameMl || !autoNumber || !contact || !locationEn || !locationMl) {
    return res.status(400).json({ error: "Missing required fields for Autorikshaw Service" });
  }

  const newAuto = {
    id: "auto_" + Date.now().toString(),
    driverNameEn,
    driverNameMl,
    autoNumber,
    contact,
    locationEn,
    locationMl,
    isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
    registeredDate: new Date().toISOString().split("T")[0]
  };

  try {
    await writeItemToFirestore("autos", newAuto.id, newAuto);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.autos = [...(database.autos || []), newAuto];
  saveDatabase(database);
  res.status(201).json(newAuto);
});

app.put("/api/autos/:id", async (req, res) => {
  const { id } = req.params;
  const { driverNameEn, driverNameMl, autoNumber, contact, locationEn, locationMl, isAvailable } = req.body;
  
  const autosList = await getCollectionData("autos");
  const itemIndex = autosList.findIndex((aut: any) => aut.id === id);

  if (itemIndex !== -1) {
    const updatedAuto = {
      ...autosList[itemIndex],
      driverNameEn: driverNameEn !== undefined ? driverNameEn : autosList[itemIndex].driverNameEn,
      driverNameMl: driverNameMl !== undefined ? driverNameMl : autosList[itemIndex].driverNameMl,
      autoNumber: autoNumber !== undefined ? autoNumber : autosList[itemIndex].autoNumber,
      contact: contact !== undefined ? contact : autosList[itemIndex].contact,
      locationEn: locationEn !== undefined ? locationEn : autosList[itemIndex].locationEn,
      locationMl: locationMl !== undefined ? locationMl : autosList[itemIndex].locationMl,
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : autosList[itemIndex].isAvailable
    };

    try {
      await writeItemToFirestore("autos", id, updatedAuto);
    } catch (error) {
      console.error("Firestore mutation failed:", error);
      return res.status(503).json({ error: "Database operation failed; no changes were saved." });
    }
    database.autos = (database.autos || []).map((aut: any) => aut.id === id ? updatedAuto : aut);
    saveDatabase(database);
    res.json({ success: true, id });
  } else {
    res.status(404).json({ error: "Autorikshaw entry not found" });
  }
});

app.delete("/api/autos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await deleteItemFromFirestore("autos", id);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.autos = (database.autos || []).filter((aut: any) => aut.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});


// 7. EXPLORE ATTAPPADI SUB-SECTIONS (destinations, cultures, stays, travelogues, photos)
// DESTINATIONS
app.get("/api/destinations", async (req, res) => {
  const data = await getCollectionData("destinations");
  res.json(data);
});
app.post("/api/destinations", async (req, res) => {
  const item = { id: "dest_" + Date.now().toString(), ...req.body };
  try {
    await writeItemToFirestore("destinations", item.id, item);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.destinations = [...(database.destinations || []), item];
  saveDatabase(database);
  res.status(201).json(item);
});
app.put("/api/destinations/:id", async (req, res) => {
  const { id } = req.params;
  const list = await getCollectionData("destinations");
  const current = list.find((x: any) => x.id === id) || {};
  const updatedItem = { ...current, ...req.body, id };
  try {
    await writeItemToFirestore("destinations", id, updatedItem);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.destinations = (database.destinations || []).map((x: any) => x.id === id ? updatedItem : x);
  saveDatabase(database);
  res.json({ success: true, id });
});
app.delete("/api/destinations/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await deleteItemFromFirestore("destinations", id);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.destinations = (database.destinations || []).filter((x: any) => x.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// CULTURES/FOOD
app.get("/api/cultures", async (req, res) => {
  const data = await getCollectionData("cultures");
  res.json(data);
});
app.post("/api/cultures", async (req, res) => {
  const item = { id: "cult_" + Date.now().toString(), ...req.body };
  try {
    await writeItemToFirestore("cultures", item.id, item);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.cultures = [...(database.cultures || []), item];
  saveDatabase(database);
  res.status(201).json(item);
});
app.put("/api/cultures/:id", async (req, res) => {
  const { id } = req.params;
  const list = await getCollectionData("cultures");
  const current = list.find((x: any) => x.id === id) || {};
  const updatedItem = { ...current, ...req.body, id };
  try {
    await writeItemToFirestore("cultures", id, updatedItem);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.cultures = (database.cultures || []).map((x: any) => x.id === id ? updatedItem : x);
  saveDatabase(database);
  res.json({ success: true, id });
});
app.delete("/api/cultures/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await deleteItemFromFirestore("cultures", id);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.cultures = (database.cultures || []).filter((x: any) => x.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// STAYS
app.get("/api/stays", async (req, res) => {
  const data = await getCollectionData("stays");
  res.json(data);
});
app.post("/api/stays", async (req, res) => {
  const item = { id: "stay_" + Date.now().toString(), ...req.body };
  try {
    await writeItemToFirestore("stays", item.id, item);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.stays = [...(database.stays || []), item];
  saveDatabase(database);
  res.status(201).json(item);
});
app.put("/api/stays/:id", async (req, res) => {
  const { id } = req.params;
  const list = await getCollectionData("stays");
  const current = list.find((x: any) => x.id === id) || {};
  const updatedItem = { ...current, ...req.body, id };
  try {
    await writeItemToFirestore("stays", id, updatedItem);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.stays = (database.stays || []).map((x: any) => x.id === id ? updatedItem : x);
  saveDatabase(database);
  res.json({ success: true, id });
});
app.delete("/api/stays/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await deleteItemFromFirestore("stays", id);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.stays = (database.stays || []).filter((x: any) => x.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// TRAVELOGUES
app.get("/api/travelogues", async (req, res) => {
  const data = await getCollectionData("travelogues");
  res.json(data);
});
app.post("/api/travelogues", async (req, res) => {
  const item = { id: "trav_" + Date.now().toString(), ...req.body };
  try {
    await writeItemToFirestore("travelogues", item.id, item);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.travelogues = [...(database.travelogues || []), item];
  saveDatabase(database);
  res.status(201).json(item);
});
app.put("/api/travelogues/:id", async (req, res) => {
  const { id } = req.params;
  const list = await getCollectionData("travelogues");
  const current = list.find((x: any) => x.id === id) || {};
  const updatedItem = { ...current, ...req.body, id };
  try {
    await writeItemToFirestore("travelogues", id, updatedItem);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.travelogues = (database.travelogues || []).map((x: any) => x.id === id ? updatedItem : x);
  saveDatabase(database);
  res.json({ success: true, id });
});
app.delete("/api/travelogues/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await deleteItemFromFirestore("travelogues", id);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.travelogues = (database.travelogues || []).filter((x: any) => x.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// PHOTO HUB
app.get("/api/photos", async (req, res) => {
  const data = await getCollectionData("photos");
  res.json(data);
});
app.post("/api/photos", async (req, res) => {
  const item = { id: "photo_" + Date.now().toString(), ...req.body };
  try {
    await writeItemToFirestore("photos", item.id, item);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.photos = [...(database.photos || []), item];
  saveDatabase(database);
  res.status(201).json(item);
});
app.put("/api/photos/:id", async (req, res) => {
  const { id } = req.params;
  const list = await getCollectionData("photos");
  const current = list.find((x: any) => x.id === id) || {};
  const updatedItem = { ...current, ...req.body, id };
  try {
    await writeItemToFirestore("photos", id, updatedItem);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.photos = (database.photos || []).map((x: any) => x.id === id ? updatedItem : x);
  saveDatabase(database);
  res.json({ success: true, id });
});
app.delete("/api/photos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await deleteItemFromFirestore("photos", id);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.photos = (database.photos || []).filter((x: any) => x.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// BUS TIMINGS/ROUTES
app.get("/api/busroutes", async (req, res) => {
  const data = await getCollectionData("busRoutes");
  res.json(data);
});
app.post("/api/busroutes", async (req, res) => {
  const item = { id: "bus_" + Date.now().toString(), ...req.body };
  try {
    await writeItemToFirestore("busRoutes", item.id, item);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.busRoutes = [...(database.busRoutes || []), item];
  saveDatabase(database);
  res.status(201).json(item);
});
app.put("/api/busroutes/:id", async (req, res) => {
  const { id } = req.params;
  const list = await getCollectionData("busRoutes");
  const current = list.find((x: any) => x.id === id) || {};
  const updatedItem = { ...current, ...req.body, id };
  try {
    await writeItemToFirestore("busRoutes", id, updatedItem);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.busRoutes = (database.busRoutes || []).map((x: any) => x.id === id ? updatedItem : x);
  saveDatabase(database);
  res.json({ success: true, id });
});
app.delete("/api/busroutes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await deleteItemFromFirestore("busRoutes", id);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.busRoutes = (database.busRoutes || []).filter((x: any) => x.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// GENERIC ROUTES ENDPOINTS
app.get("/api/routes", async (req, res) => {
  const data = await getCollectionData("routes");
  res.json(data);
});
app.post("/api/routes", async (req, res) => {
  const item = { id: "route_" + Date.now().toString(), ...req.body };
  try {
    await writeItemToFirestore("routes", item.id, item);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.routes = [...(database.routes || []), item];
  saveDatabase(database);
  res.status(201).json(item);
});
app.delete("/api/routes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await deleteItemFromFirestore("routes", id);
  } catch (error) {
    console.error("Firestore mutation failed:", error);
    return res.status(503).json({ error: "Database operation failed; no changes were saved." });
  }
  database.routes = (database.routes || []).filter((x: any) => x.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});


// 8. AI Assistants integration with Gemini Web API
app.post("/api/admin/translate", async (req, res) => {
  const { text, targetLang } = req.body;
  if (!text) return res.status(400).json({ error: "No text supplied for translation" });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: "Gemini API key is not configured on the server. Please check Settings > Secrets." });
    }

    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });

    const isToMalayalam = targetLang === "ml";
    const prompt = isToMalayalam 
      ? `You are an expert translator for 'Attappadi Online' portal.
         Translate the following English text into native, natural, clear, and culturally accurate Malayalam.
         The translation MUST be completely natural in tone and generic in words, suitable for news articles, local shop directories, ad campaigns, notices, emergency alerts, or schedules.
         Ensure perfect Malayalam grammar and phrasing. Avoid robotic or overly literal word-by-word translation.
         Return ONLY the translated Malayalam text and nothing else. No introductions, explanations, or markdown block styling.
         
         Text to Translate:
         ${text}`
      : `You are an expert translator for 'Attappadi Online' portal.
         Translate the following Malayalam text into clear, completely natural, error-free, and appropriate English.
         The translation MUST be perfectly natural in tone, general-purpose/generic in phrasing, and appropriate for local directories, public boards, transit, or notices.
         Keep place names accurate: Agali, Mukkali, Thavalam, Kottathara, Sholayur, Pudur, Anaikatty, etc.
         Return ONLY the translated English text and nothing else. No introductions, explanations, or markdown block styling.
         
         Text to Translate:
         ${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt
    });

    res.json({ translatedText: response.text?.trim() });
  } catch (err: any) {
    console.log(`Translation Notice - Gemini API returned notice: ${err.message || "Rate limited/Quota Exceeded"}. Trying MyMemory free backup translator...`);
    
    // BACKUP FREE TRANSLATION ENGINE (MyMemory Translate API - completely free, no key required)
    try {
      const isToMalayalam = targetLang === "ml";
      const langpair = isToMalayalam ? "en|ml" : "ml|en";
      const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`;
      
      const backupResponse = await fetch(myMemoryUrl, {
        headers: { "User-Agent": "AttappadiOnlinePortal/1.0" }
      });
      
      if (backupResponse.ok) {
        const data: any = await backupResponse.json();
        const translatedBackup = data?.responseData?.translatedText;
        if (translatedBackup) {
          console.log("MyMemory Backup Translator successfully fetched translation:", translatedBackup);
          return res.json({
            translatedText: translatedBackup.trim(),
            isBackup: true,
            warning: "Fallback to active Free public translation service engine."
          });
        }
      }
    } catch (backupErr: any) {
      console.log("MyMemory Backup Translator also failed:", backupErr.message);
    }

    // Graceful fallback to original text if both Gemini and the backup fail
    res.json({ 
      translatedText: text, 
      isFallback: true, 
      warning: "All translation engines temporarily unavailable. Visual placeholder returned.",
      error: err.message || "Failed to communicate with translation assistant." 
    });
  }
});

// AI Assisted news generation/expansion helper
app.post("/api/admin/ai-generate", async (req, res) => {
  const { titleSuggest, mainPoints } = req.body;
  if (!titleSuggest) return res.status(400).json({ error: "Please provide a headline or idea." });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: "Gemini API key is not configured on the server. Please check Settings > Secrets." });
    }

    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { "User-Agent": "aistudio-build" }
      }
    });

    const prompt = `You are a master local reporter for 'Attappadi Online' in Kerala, Palakkad district.
      Write an elegant, professional, trustworthy news article based on this idea: "${titleSuggest}".
      Points outline or clues: "${mainPoints || "None provided. Generate realistic news matching local issues in Attappadi Block"}".
      
      Generate a realistic, balanced news report suited for Attappadi locals. Output should include high-quality Malayalam and English titles and narratives.
      Your response MUST be strict valid JSON matching exactly the schemas below. No markdown wrap, no backticks enclosing, just pure JSON text.
      
      JSON Scheme to return:
      {
        "titleEn": "A concise English news headline",
        "titleMl": "നല്ല ശൈലിയിലുള്ള മലയാളം വാർത്താ തലക്കെട്ട്",
        "contentEn": "A detailed, professional two-paragraph English news article writing",
        "contentMl": "വിശദവും പത്രപ്രവർത്തന ശൈലിയിലുള്ളതുമായ രണ്ടു ഖണ്ഡികകളുള്ള മലയാളം വാർത്താ വിവരണം"
      }`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json(parsed);
  } catch (err: any) {
    console.log(`AI Assist Notice - API service returned notice: ${err.message || "Rate limited"}`);
    res.status(500).json({ error: err.message || "Failed to generate AI reporting assist content." });
  }
});

// Dynamic Weather information helper
app.get("/api/weather", (req, res) => {
  const hour = new Date().getHours();
  const baseTemp = (hour < 7 || hour > 19) ? 21 : 28;
  
  const weatherData = {
    blockName: "Attappadi Block valley",
    conditionEn: hour > 10 && hour < 17 ? "Scattered Showers" : "Mist & Heavy Overcast",
    conditionMl: hour > 10 && hour < 17 ? "ചിലയിടങ്ങളിൽ മഴ" : "മൂടൽമഞ്ഞും കനത്ത മേഘാവൃതമായ അന്തരീക്ഷവും",
    humidity: "86%",
    breezeEn: "SW 18 km/h",
    breezeMl: "തെക്ക്-പടിഞ്ഞാറൻ കാറ്റ് 18 കി.മീ/മണിക്കൂർ",
    subRegions: [
      { name: "Agali (Town)", temp: baseTemp + 1, conditionEn: "Overcast", conditionMl: "മേഘാവൃതം" },
      { name: "Mukkali (Hills)", temp: baseTemp - 2, conditionEn: "Continuous drizzle", conditionMl: "തുള്ളിമഴ" },
      { name: "Thavalam", temp: baseTemp + 0.5, conditionEn: "Passing Clouds", conditionMl: "മേഘങ്ങൾ" },
      { name: "Kottathara", temp: baseTemp + 0, conditionEn: "Heavy Breeze", conditionMl: "ശക്തമായ കാറ്റ്" },
      { name: "Sholayur", temp: baseTemp + 1.5, conditionEn: "Windy & Sunny", conditionMl: "കാറ്റുള്ള അന്തരീക്ഷം" },
      { name: "Pudur", temp: baseTemp - 1, conditionEn: "Mist Cover", conditionMl: "മൂടൽമഞ്ഞ്" },
      { name: "Anaikatty", temp: baseTemp + 2, conditionEn: "Humid & Cloudy", conditionMl: "മേഘാവൃതം" },
      { name: "Jellippara", temp: baseTemp - 0.5, conditionEn: "Cool Breeze", conditionMl: "തണുത്ത കാറ്റ്" },
      { name: "Chittur", temp: baseTemp + 1, conditionEn: "Light Showers", conditionMl: "ചെറിയ തോതിൽ മഴ" }
    ]
  };
  res.json(weatherData);
});

app.all("/api/debug-route-details", (req, res) => {
  res.status(200).json({
    message: "Attappadi Online Catch-all Router Debug",
    url: req.url,
    originalUrl: req.originalUrl,
    method: req.method,
    headers: req.headers,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || "(not set)"
    },
    firestore: {
      initialized: !!firestoreDb,
      configPath: CONFIG_PATH,
      configExists: fs.existsSync(CONFIG_PATH),
      hasPendingWrites: false
    },
    databaseSummary: {
      newsCount: (database.news || []).length,
      opinionsCount: (database.opinions || []).length,
      eventsCount: (database.events || []).length,
      directoryCount: (database.directory || []).length,
      emergencyCount: (database.emergency || []).length,
      noticesCount: (database.notices || []).length,
      destinationsCount: (database.destinations || []).length,
      culturesCount: (database.cultures || []).length,
      staysCount: (database.stays || []).length,
      lostFoundCount: (database.lostFound || []).length
    }
  });
});

// Centralized error handling for rejected async route operations.
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("API request failed:", err);
  if (!res.headersSent) res.status(503).json({ error: "The operation could not be completed. Please retry later." });
});

// Setup dev server with Vite OR static server in production
async function startServer() {
  if (!process.env.VERCEL) {
    // For non-serverless server, synchronize immediately on start
    try {
      await initFirestoreDatabase();
    } catch (err) {
      console.error("❌ Critical error during Firestore initialization:", err);
    }
    if (process.env.NODE_ENV !== "production") {
      // Dynamically import Vite only in development to prevent native dependency issues on Vercel
      const { createServer: createViteServer } = await import("vite");
      // Mount Vite for development
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      // Serve production static build assets
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Attappadi Online Server is listening successfully on port ${PORT}`);
    });
  }
}

startServer();

export default app;
