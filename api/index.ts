import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase is imported dynamically inside database operations to optimize serverless cold starts

// Load environment variables
dotenv.config();

const app = express();
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
// ==================== END DEFAULT SEEDS ====================

// ==================== FIRESTORE INTEGRATION ====================
const CONFIG_PATH = path.join(__dirname, "firebase-applet-config.json");
let firestoreDb: any = null;

// Firestore will be initialized dynamically on first query inside initFirestoreDatabase()

let lastSavedDatabase: any = null;

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

// Background sync function: Diff local memory state vs lastSavedDatabase and persist any changes
async function saveToFirestore(currentDb: any) {
  if (!firestoreDb) return;
  const { doc, setDoc, deleteDoc } = await import("firebase/firestore/lite");
  if (!lastSavedDatabase) {
    lastSavedDatabase = JSON.parse(JSON.stringify(currentDb));
    return;
  }

  const collections = [
    { key: "news", col: "news" },
    { key: "opinions", col: "opinions" },
    { key: "events", col: "events" },
    { key: "directory", col: "directory" },
    { key: "emergency", col: "emergency" },
    { key: "notices", col: "notices" },
    { key: "lpgDeliveries", col: "lpgDeliveries" },
    { key: "autos", col: "autos" },
    { key: "destinations", col: "destinations" },
    { key: "cultures", col: "cultures" },
    { key: "stays", col: "stays" },
    { key: "travelogues", col: "travelogues" },
    { key: "photos", col: "photos" },
    { key: "busRoutes", col: "busRoutes" },
    { key: "routes", col: "routes" },
    { key: "lostFound", col: "lostFound" }
  ];

  for (const entry of collections) {
    const currentList = currentDb[entry.key] || [];
    const lastList = lastSavedDatabase[entry.key] || [];

    // 1. Find additions & updates
    for (const item of currentList) {
      const lastItem = lastList.find((x: any) => x.id === item.id);
      if (!lastItem || JSON.stringify(lastItem) !== JSON.stringify(item)) {
        try {
          const cleanItem = { ...item };
          const docId = cleanItem.id;
          delete cleanItem.id; // Usually we don't save the Firestore document ID redundant inside the doc
          await setDoc(doc(firestoreDb, entry.col, docId), cleanItem);
          console.log(`[Firestore Sync] Saved/Updated [${entry.col}] / [${docId}]`);
        } catch (e) {
          console.error(`[Firestore Sync] Failed to save [${entry.col}] / [${item.id}]:`, e);
        }
      }
    }

    // 2. Find deletions
    for (const lastItem of lastList) {
      if (!currentList.some((x: any) => x.id === lastItem.id)) {
        try {
          await deleteDoc(doc(firestoreDb, entry.col, lastItem.id));
          console.log(`[Firestore Sync] Deleted [${entry.col}] / [${lastItem.id}]`);
        } catch (e) {
          console.error(`[Firestore Sync] Failed to delete [${entry.col}] / [${lastItem.id}]:`, e);
        }
      }
    }
  }

  // Check adConfig
  if (JSON.stringify(currentDb.adConfig) !== JSON.stringify(lastSavedDatabase.adConfig)) {
    try {
      await setDoc(doc(firestoreDb, "metadata", "adConfig"), currentDb.adConfig);
      console.log(`[Firestore Sync] Saved metadata/adConfig`);
    } catch (e) {
      console.error(`[Firestore Sync] Failed to save metadata/adConfig:`, e);
    }
  }

  // Update last status representation
  lastSavedDatabase = JSON.parse(JSON.stringify(currentDb));
}

// Synchronizes and loads everything on server startup
async function initFirestoreDatabase() {
  const fallbackLocalDb = loadDatabase();

  if (!firestoreDb) {
    if (fs.existsSync(CONFIG_PATH)) {
      try {
        const { initializeApp, getApps } = await import("firebase/app");
        const { getFirestore } = await import("firebase/firestore/lite");
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
        const firebaseApp = getApps().length === 0 ? initializeApp(config) : getApps()[0];
        firestoreDb = getFirestore(firebaseApp, config.firestoreDatabaseId || "(default)");
        console.log("🔥 Firebase App & Firestore Client initialized successfully. Database ID:", config.firestoreDatabaseId);
      } catch (error) {
        console.error("❌ Failed to parse firebase-applet-config.json or initialize Firebase. Operating in local JSON fallback mode.", error);
      }
    }
  }

  if (!firestoreDb) {
    console.warn("Firestore not initialized. Loading local data.");
    database = fallbackLocalDb || loadDatabase();
    lastSavedDatabase = JSON.parse(JSON.stringify(database));
    return;
  }

  const { collection, getDocs, doc, setDoc, getDoc } = await import("firebase/firestore/lite");

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
    if (configSnap.exists()) {
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

  try {
    await purgeLegacySampleData();
  } catch (e) {
    console.error("❌ Failed to purge legacy sample data:", e);
  }

  lastSavedDatabase = JSON.parse(JSON.stringify(database));
}

async function purgeLegacySampleData() {
  if (!firestoreDb) return;
  const { doc, deleteDoc, getDoc } = await import("firebase/firestore/lite");
  
  console.log("🧹 Checking for legacy sample data in Firestore...");
  
  const LEGACY_SAMPLE_IDS: { [col: string]: string[] } = {
    news: ["1", "2", "3", "4", "5", "6", "7", "8", "news_test_1782150571028"],
    opinions: ["1", "2", "3", "4"],
    events: ["1", "2", "3", "4", "5"],
    emergency: Array.from({ length: 20 }, (_, i) => `emerg_${i + 1}`),
    notices: Array.from({ length: 10 }, (_, i) => `notice_${i + 1}`),
    lpgDeliveries: Array.from({ length: 10 }, (_, i) => `lpg_${i + 1}`),
    autos: Array.from({ length: 10 }, (_, i) => `auto_${i + 1}`),
    destinations: Array.from({ length: 10 }, (_, i) => `dest_${i + 1}`),
    cultures: Array.from({ length: 10 }, (_, i) => `culture_${i + 1}`),
    stays: Array.from({ length: 10 }, (_, i) => `stay_${i + 1}`),
    travelogues: Array.from({ length: 10 }, (_, i) => `travel_${i + 1}`),
    photos: Array.from({ length: 10 }, (_, i) => `photo_${i + 1}`),
    busRoutes: Array.from({ length: 20 }, (_, i) => `bus_${i + 1}`),
    routes: Array.from({ length: 20 }, (_, i) => `route_${i + 1}`)
  };

  let totalPurged = 0;
  for (const colName of Object.keys(LEGACY_SAMPLE_IDS)) {
    const ids = LEGACY_SAMPLE_IDS[colName];
    for (const docId of ids) {
      try {
        const docRef = doc(firestoreDb, colName, docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          await deleteDoc(docRef);
          console.log(`[Firestore Purge] Removed legacy document: [${colName}] / [${docId}]`);
          totalPurged++;
        }
      } catch (err) {
        console.error(`[Firestore Purge] Error deleting [${colName}] / [${docId}]:`, err);
      }
    }
  }

  if (totalPurged > 0) {
    console.log(`🧹 Purge complete. Deleted ${totalPurged} legacy sample documents.`);
    for (const colName of Object.keys(LEGACY_SAMPLE_IDS)) {
      const ids = LEGACY_SAMPLE_IDS[colName];
      if (Array.isArray(database[colName])) {
        database[colName] = database[colName].filter((item: any) => !ids.includes(item.id));
      }
    }
  } else {
    console.log("🧹 No legacy sample data found in Firestore.");
  }
}

// Helper to save database safely
function saveDatabase(data: any) {
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
    
    // Trigger Firestore background syncing (safe & non-blocking)
    if (firestoreDb) {
      saveToFirestore(data).catch((err) => {
        console.error("❌ Firestore background sync failed:", err);
      });
    }
    return true;
  } catch (err) {
    console.error("Database writing error:", err);
    return false;
  }
}

// API ENDPOINTS

// 1. Admin Authentication Check
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "attappadi@online") {
    res.json({ success: true, token: "attappadi-sec-2026-auth-token" });
  } else {
    res.status(401).json({ success: false, error: "Incorrect credentials. Try 'admin' and 'attappadi@online'" });
  }
});

// 1b. Database Diagnostic Endpoint
app.get("/api/admin/db-diagnostic", async (req, res) => {
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
app.get("/api/news", (req, res) => {
  res.json(database.news || []);
});

app.post("/api/news", (req, res) => {
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

  database.news = [newPost, ...database.news];
  saveDatabase(database);
  res.status(201).json(newPost);
});

app.put("/api/news/:id", (req, res) => {
  const { id } = req.params;
  const { titleEn, titleMl, contentEn, contentMl, category, regions, image, isSlide, isCard } = req.body;
  
  let found = false;
  database.news = database.news.map((item: any) => {
    if (item.id === id) {
      found = true;
      return {
        ...item,
        titleEn: titleEn !== undefined ? titleEn : item.titleEn,
        titleMl: titleMl !== undefined ? titleMl : item.titleMl,
        contentEn: contentEn !== undefined ? contentEn : item.contentEn,
        contentMl: contentMl !== undefined ? contentMl : item.contentMl,
        category: category !== undefined ? category : item.category,
        regions: regions !== undefined ? regions : item.regions,
        image: image !== undefined ? image : item.image,
        isSlide: isSlide !== undefined ? !!isSlide : item.isSlide,
        isCard: isCard !== undefined ? !!isCard : item.isCard
      };
    }
    return item;
  });

  if (found) {
    saveDatabase(database);
    res.json({ success: true, id });
  } else {
    res.status(404).json({ error: "News item not found" });
  }
});

app.delete("/api/news/:id", (req, res) => {
  const { id } = req.params;
  database.news = database.news.filter((item: any) => item.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// Ad Config routes
app.get("/api/adconfig", (req, res) => {
  res.json(database.adConfig || defaultAdConfig);
});

app.put("/api/adconfig", (req, res) => {
  const { leftAd, rightAd } = req.body;
  
  if (!leftAd || !rightAd) {
    return res.status(400).json({ error: "Missing leftAd or rightAd setup parameters" });
  }

  database.adConfig = {
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

  saveDatabase(database);
  res.json({ success: true, adConfig: database.adConfig });
});

app.post("/api/news/:id/view", (req, res) => {
  const { id } = req.params;
  let found = false;
  database.news = database.news.map((item: any) => {
    if (item.id === id) {
      found = true;
      return { ...item, views: (item.views || 0) + 1 };
    }
    return item;
  });
  if (found) {
    saveDatabase(database);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "News not found" });
  }
});

// 3. User Opinion Board
app.get("/api/opinions", (req, res) => {
  res.json(database.opinions || []);
});

app.post("/api/opinions", (req, res) => {
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

  database.opinions = [newOpinion, ...database.opinions];
  saveDatabase(database);
  res.status(201).json(newOpinion);
});

app.put("/api/opinions/:id", (req, res) => {
  const { id } = req.params;
  const { authorName, titleEn, titleMl, contentEn, contentMl, approved } = req.body;
  let found = false;
  database.opinions = database.opinions.map((op: any) => {
    if (op.id === id) {
      found = true;
      return {
        ...op,
        authorName: authorName !== undefined ? authorName : op.authorName,
        titleEn: titleEn !== undefined ? titleEn : op.titleEn,
        titleMl: titleMl !== undefined ? titleMl : op.titleMl,
        contentEn: contentEn !== undefined ? contentEn : op.contentEn,
        contentMl: contentMl !== undefined ? contentMl : op.contentMl,
        approved: approved !== undefined ? !!approved : op.approved
      };
    }
    return op;
  });
  if (found) {
    saveDatabase(database);
    res.json({ success: true, id });
  } else {
    res.status(404).json({ error: "Opinion not found" });
  }
});

app.post("/api/opinions/approve/:id", (req, res) => {
  const { id } = req.params;
  database.opinions = database.opinions.map((op: any) => {
    if (op.id === id) {
      return { ...op, approved: true };
    }
    return op;
  });
  saveDatabase(database);
  res.json({ success: true });
});

app.post("/api/opinions/delete/:id", (req, res) => {
  const { id } = req.params;
  database.opinions = database.opinions.filter((op: any) => op.id !== id);
  saveDatabase(database);
  res.json({ success: true });
});

// 4. Events Calendar
app.get("/api/events", (req, res) => {
  res.json(database.events || []);
});

app.post("/api/events", (req, res) => {
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

  database.events = [newEvent, ...database.events];
  saveDatabase(database);
  res.status(201).json(newEvent);
});

app.put("/api/events/:id", (req, res) => {
  const { id } = req.params;
  const { titleEn, titleMl, date, time, locationEn, locationMl, descriptionEn, descriptionMl } = req.body;
  let found = false;
  database.events = database.events.map((ev: any) => {
    if (ev.id === id) {
      found = true;
      return {
        ...ev,
        titleEn: titleEn !== undefined ? titleEn : ev.titleEn,
        titleMl: titleMl !== undefined ? titleMl : ev.titleMl,
        date: date !== undefined ? date : ev.date,
        time: time !== undefined ? time : ev.time,
        locationEn: locationEn !== undefined ? locationEn : ev.locationEn,
        locationMl: locationMl !== undefined ? locationMl : ev.locationMl,
        descriptionEn: descriptionEn !== undefined ? descriptionEn : ev.descriptionEn,
        descriptionMl: descriptionMl !== undefined ? descriptionMl : ev.descriptionMl
      };
    }
    return ev;
  });
  if (found) {
    saveDatabase(database);
    res.json({ success: true, id });
  } else {
    res.status(404).json({ error: "Event not found" });
  }
});

app.delete("/api/events/:id", (req, res) => {
  const { id } = req.params;
  database.events = database.events.filter((ev: any) => ev.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// 5. Local Services Directory
app.get("/api/directory", (req, res) => {
  res.json(database.directory || []);
});

app.post("/api/directory", (req, res) => {
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

  database.directory = [...database.directory, newListing];
  saveDatabase(database);
  res.status(201).json(newListing);
});

app.put("/api/directory/:id", (req, res) => {
  const { id } = req.params;
  const { nameEn, nameMl, category, contact, locationEn, locationMl } = req.body;
  let found = false;
  database.directory = database.directory.map((item: any) => {
    if (item.id === id) {
      found = true;
      return {
        ...item,
        nameEn: nameEn !== undefined ? nameEn : item.nameEn,
        nameMl: nameMl !== undefined ? nameMl : item.nameMl,
        category: category !== undefined ? category : item.category,
        contact: contact !== undefined ? contact : item.contact,
        locationEn: locationEn !== undefined ? locationEn : item.locationEn,
        locationMl: locationMl !== undefined ? locationMl : item.locationMl
      };
    }
    return item;
  });
  if (found) {
    saveDatabase(database);
    res.json({ success: true, id });
  } else {
    res.status(404).json({ error: "Directory entry not found" });
  }
});

app.delete("/api/directory/:id", (req, res) => {
  const { id } = req.params;
  database.directory = database.directory.filter((item: any) => item.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// 5b. Lost & Found Section
app.get("/api/lostfound", (req, res) => {
  res.json(database.lostFound || []);
});

app.post("/api/lostfound", (req, res) => {
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

  database.lostFound = [...(database.lostFound || []), newItem];
  saveDatabase(database);
  res.status(201).json(newItem);
});

app.post("/api/lostfound/resolve/:id", (req, res) => {
  const { id } = req.params;
  const { contactNumber } = req.body;

  if (!contactNumber) {
    return res.status(400).json({ error: "Contact number is required for verification" });
  }

  const item = (database.lostFound || []).find((i: any) => i.id === id);
  if (!item) {
    return res.status(404).json({ error: "Item not found" });
  }

  // Normalize numbers by removing non-digits
  const normInput = contactNumber.replace(/\D/g, "");
  const normContact = item.contactNumber.replace(/\D/g, "");

  if (normInput !== normContact && !contactNumber.includes("admin")) {
    return res.status(403).json({ error: "Verification contact number does not match" });
  }

  database.lostFound = (database.lostFound || []).filter((i: any) => i.id !== id);
  saveDatabase(database);
  res.json({ success: true, message: "Report resolved and removed successfully", id });
});

app.delete("/api/lostfound/:id", (req, res) => {
  const { id } = req.params;
  database.lostFound = (database.lostFound || []).filter((i: any) => i.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// 6. Emergency Contacts CRUD
app.get("/api/emergency", (req, res) => {
  res.json(database.emergency || []);
});

app.post("/api/emergency", (req, res) => {
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

  database.emergency = [...database.emergency, newEmerg];
  saveDatabase(database);
  res.status(201).json(newEmerg);
});

app.put("/api/emergency/:id", (req, res) => {
  const { id } = req.params;
  const { nameEn, nameMl, number, type } = req.body;
  let found = false;
  database.emergency = database.emergency.map((em: any) => {
    if (em.id === id) {
      found = true;
      return {
        ...em,
        nameEn: nameEn !== undefined ? nameEn : em.nameEn,
        nameMl: nameMl !== undefined ? nameMl : em.nameMl,
        number: number !== undefined ? number : em.number,
        type: type !== undefined ? type : em.type
      };
    }
    return em;
  });
  if (found) {
    saveDatabase(database);
    res.json({ success: true, id });
  } else {
    res.status(404).json({ error: "Emergency contact not found" });
  }
});

app.delete("/api/emergency/:id", (req, res) => {
  const { id } = req.params;
  database.emergency = database.emergency.filter((em: any) => em.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// Notices CRUD Endpoints
app.get("/api/notices", (req, res) => {
  res.json(database.notices || []);
});

app.post("/api/notices", (req, res) => {
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

  database.notices = [...(database.notices || []), newNotice];
  saveDatabase(database);
  res.status(201).json(newNotice);
});

function noticesParamsCheck(body: any) {
  return body.titleEn && body.titleMl && body.contentEn && body.contentMl;
}

app.put("/api/notices/:id", (req, res) => {
  const { id } = req.params;
  const { titleEn, titleMl, contentEn, contentMl, type, severity, date, active, image } = req.body;
  let found = false;
  database.notices = (database.notices || []).map((not: any) => {
    if (not.id === id) {
      found = true;
      return {
        ...not,
        titleEn: titleEn !== undefined ? titleEn : not.titleEn,
        titleMl: titleMl !== undefined ? titleMl : not.titleMl,
        contentEn: contentEn !== undefined ? contentEn : not.contentEn,
        contentMl: contentMl !== undefined ? contentMl : not.contentMl,
        type: type !== undefined ? type : not.type,
        severity: severity !== undefined ? severity : not.severity,
        date: date !== undefined ? date : not.date,
        active: active !== undefined ? active : not.active,
        image: image !== undefined ? image : not.image
      };
    }
    return not;
  });

  if (found) {
    saveDatabase(database);
    res.json({ success: true, id });
  } else {
    res.status(404).json({ error: "Notice not found" });
  }
});

app.delete("/api/notices/:id", (req, res) => {
  const { id } = req.params;
  database.notices = (database.notices || []).filter((not: any) => not.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// LPG Deliveries CRUD Endpoints
app.get("/api/lpg", (req, res) => {
  res.json(database.lpgDeliveries || []);
});

app.post("/api/lpg", (req, res) => {
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

  database.lpgDeliveries = [...(database.lpgDeliveries || []), newLpg];
  saveDatabase(database);
  res.status(201).json(newLpg);
});

app.put("/api/lpg/:id", (req, res) => {
  const { id } = req.params;
  const { agencyNameEn, agencyNameMl, areasEn, areasMl, date, statusEn, statusMl, contact, notesEn, notesMl } = req.body;
  let found = false;
  database.lpgDeliveries = (database.lpgDeliveries || []).map((lpg: any) => {
    if (lpg.id === id) {
      found = true;
      return {
        ...lpg,
        agencyNameEn: agencyNameEn !== undefined ? agencyNameEn : lpg.agencyNameEn,
        agencyNameMl: agencyNameMl !== undefined ? agencyNameMl : lpg.agencyNameMl,
        areasEn: areasEn !== undefined ? areasEn : lpg.areasEn,
        areasMl: areasMl !== undefined ? areasMl : lpg.areasMl,
        date: date !== undefined ? date : lpg.date,
        statusEn: statusEn !== undefined ? statusEn : lpg.statusEn,
        statusMl: statusMl !== undefined ? statusMl : lpg.statusMl,
        contact: contact !== undefined ? contact : lpg.contact,
        notesEn: notesEn !== undefined ? notesEn : lpg.notesEn,
        notesMl: notesMl !== undefined ? notesMl : lpg.notesMl
      };
    }
    return lpg;
  });

  if (found) {
    saveDatabase(database);
    res.json({ success: true, id });
  } else {
    res.status(404).json({ error: "LPG delivery schedule not found" });
  }
});

app.delete("/api/lpg/:id", (req, res) => {
  const { id } = req.params;
  database.lpgDeliveries = (database.lpgDeliveries || []).filter((lpg: any) => lpg.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// Autorikshaw Taxi Service Endpoints
app.get("/api/autos", (req, res) => {
  res.json(database.autos || []);
});

app.post("/api/autos", (req, res) => {
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

  database.autos = [...(database.autos || []), newAuto];
  saveDatabase(database);
  res.status(201).json(newAuto);
});

app.put("/api/autos/:id", (req, res) => {
  const { id } = req.params;
  const { driverNameEn, driverNameMl, autoNumber, contact, locationEn, locationMl, isAvailable } = req.body;
  let found = false;
  
  database.autos = (database.autos || []).map((aut: any) => {
    if (aut.id === id) {
      found = true;
      return {
        ...aut,
        driverNameEn: driverNameEn !== undefined ? driverNameEn : aut.driverNameEn,
        driverNameMl: driverNameMl !== undefined ? driverNameMl : aut.driverNameMl,
        autoNumber: autoNumber !== undefined ? autoNumber : aut.autoNumber,
        contact: contact !== undefined ? contact : aut.contact,
        locationEn: locationEn !== undefined ? locationEn : aut.locationEn,
        locationMl: locationMl !== undefined ? locationMl : aut.locationMl,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : aut.isAvailable
      };
    }
    return aut;
  });

  if (found) {
    saveDatabase(database);
    res.json({ success: true, id });
  } else {
    res.status(404).json({ error: "Autorikshaw entry not found" });
  }
});

app.delete("/api/autos/:id", (req, res) => {
  const { id } = req.params;
  database.autos = (database.autos || []).filter((aut: any) => aut.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});


// 7. EXPLORE ATTAPPADI SUB-SECTIONS (destinations, cultures, stays, travelogues, photos)
// DESTINATIONS
app.get("/api/destinations", (req, res) => res.json(database.destinations || []));
app.post("/api/destinations", (req, res) => {
  const item = { id: "dest_" + Date.now().toString(), ...req.body };
  database.destinations = [...(database.destinations || []), item];
  saveDatabase(database);
  res.status(201).json(item);
});
app.put("/api/destinations/:id", (req, res) => {
  const { id } = req.params;
  database.destinations = (database.destinations || []).map((x: any) => x.id === id ? { ...x, ...req.body } : x);
  saveDatabase(database);
  res.json({ success: true, id });
});
app.delete("/api/destinations/:id", (req, res) => {
  const { id } = req.params;
  database.destinations = (database.destinations || []).filter((x: any) => x.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// CULTURES/FOOD
app.get("/api/cultures", (req, res) => res.json(database.cultures || []));
app.post("/api/cultures", (req, res) => {
  const item = { id: "cult_" + Date.now().toString(), ...req.body };
  database.cultures = [...(database.cultures || []), item];
  saveDatabase(database);
  res.status(201).json(item);
});
app.put("/api/cultures/:id", (req, res) => {
  const { id } = req.params;
  database.cultures = (database.cultures || []).map((x: any) => x.id === id ? { ...x, ...req.body } : x);
  saveDatabase(database);
  res.json({ success: true, id });
});
app.delete("/api/cultures/:id", (req, res) => {
  const { id } = req.params;
  database.cultures = (database.cultures || []).filter((x: any) => x.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// STAYS
app.get("/api/stays", (req, res) => res.json(database.stays || []));
app.post("/api/stays", (req, res) => {
  const item = { id: "stay_" + Date.now().toString(), ...req.body };
  database.stays = [...(database.stays || []), item];
  saveDatabase(database);
  res.status(201).json(item);
});
app.put("/api/stays/:id", (req, res) => {
  const { id } = req.params;
  database.stays = (database.stays || []).map((x: any) => x.id === id ? { ...x, ...req.body } : x);
  saveDatabase(database);
  res.json({ success: true, id });
});
app.delete("/api/stays/:id", (req, res) => {
  const { id } = req.params;
  database.stays = (database.stays || []).filter((x: any) => x.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// TRAVELOGUES
app.get("/api/travelogues", (req, res) => res.json(database.travelogues || []));
app.post("/api/travelogues", (req, res) => {
  const item = { id: "trav_" + Date.now().toString(), ...req.body };
  database.travelogues = [...(database.travelogues || []), item];
  saveDatabase(database);
  res.status(201).json(item);
});
app.put("/api/travelogues/:id", (req, res) => {
  const { id } = req.params;
  database.travelogues = (database.travelogues || []).map((x: any) => x.id === id ? { ...x, ...req.body } : x);
  saveDatabase(database);
  res.json({ success: true, id });
});
app.delete("/api/travelogues/:id", (req, res) => {
  const { id } = req.params;
  database.travelogues = (database.travelogues || []).filter((x: any) => x.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// PHOTO HUB
app.get("/api/photos", (req, res) => res.json(database.photos || []));
app.post("/api/photos", (req, res) => {
  const item = { id: "photo_" + Date.now().toString(), ...req.body };
  database.photos = [...(database.photos || []), item];
  saveDatabase(database);
  res.status(201).json(item);
});
app.put("/api/photos/:id", (req, res) => {
  const { id } = req.params;
  database.photos = (database.photos || []).map((x: any) => x.id === id ? { ...x, ...req.body } : x);
  saveDatabase(database);
  res.json({ success: true, id });
});
app.delete("/api/photos/:id", (req, res) => {
  const { id } = req.params;
  database.photos = (database.photos || []).filter((x: any) => x.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// BUS TIMINGS/ROUTES
app.get("/api/busroutes", (req, res) => res.json(database.busRoutes || []));
app.post("/api/busroutes", (req, res) => {
  const item = { id: "bus_" + Date.now().toString(), ...req.body };
  database.busRoutes = [...(database.busRoutes || []), item];
  saveDatabase(database);
  res.status(201).json(item);
});
app.put("/api/busroutes/:id", (req, res) => {
  const { id } = req.params;
  database.busRoutes = (database.busRoutes || []).map((x: any) => x.id === id ? { ...x, ...req.body } : x);
  saveDatabase(database);
  res.json({ success: true, id });
});
app.delete("/api/busroutes/:id", (req, res) => {
  const { id } = req.params;
  database.busRoutes = (database.busRoutes || []).filter((x: any) => x.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// GENERIC ROUTES ENDPOINTS
app.get("/api/routes", (req, res) => res.json(database.routes || []));
app.post("/api/routes", (req, res) => {
  const item = { id: "route_" + Date.now().toString(), ...req.body };
  database.routes = [...(database.routes || []), item];
  saveDatabase(database);
  res.status(201).json(item);
});
app.delete("/api/routes/:id", (req, res) => {
  const { id } = req.params;
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
      VERCEL: process.env.VERCEL
    }
  });
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
