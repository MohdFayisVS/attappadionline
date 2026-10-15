/**
 * Read-only Firestore JSON export for Spark-plan projects.
 * Run on a trusted local computer: FIREBASE_SERVICE_ACCOUNT_JSON='...' npm run backup:firestore
 * Alternatively configure GOOGLE_APPLICATION_CREDENTIALS to point to a local key file.
 * Never commit credentials or backup output; backups may contain personal data.
 */
import { initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { mkdir, open, rename, rm } from "node:fs/promises";
import { resolve, join } from "node:path";
import { randomUUID } from "node:crypto";

const projectId = process.env.FIREBASE_PROJECT_ID;
if (!projectId) throw new Error("FIREBASE_PROJECT_ID is required");
const credential = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  ? cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))
  : applicationDefault();
initializeApp({ projectId, credential });
const db = getFirestore();
const databaseId = process.env.FIREBASE_DATABASE_ID || "(default)";
if (databaseId !== "(default)") throw new Error("Non-default database backup requires explicit implementation; refusing partial export");
const dir = resolve(process.env.BACKUP_DIR || "./private-backups");
await mkdir(dir, { recursive: true, mode: 0o700 });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const destination = join(dir, `firestore-${projectId}-${stamp}.json`);
const temporary = destination + "." + randomUUID() + ".tmp";
const out = await open(temporary, "wx", 0o600);
const counts: Record<string, number> = {};
let total = 0;
try {
  // Discover root collections instead of relying on a hardcoded app collection list.
  const collections = await db.listCollections();
  await out.writeFile('{"format":"attappadi-firestore-export-v1","projectId":' + JSON.stringify(projectId)
    + ',"databaseId":"(default)","exportedAt":' + JSON.stringify(new Date().toISOString()) + ',"documents":[');
  let first = true;
  async function exportCollection(ref: FirebaseFirestore.CollectionReference) {
    const docs = await ref.get();
    counts[ref.path] = docs.size;
    for (const doc of docs.docs) {
      const entry = { path: doc.ref.path, data: doc.data() };
      await out.writeFile((first ? "" : ",") + JSON.stringify(entry));
      first = false;
      total++;
      for (const sub of await doc.ref.listCollections()) await exportCollection(sub);
    }
  }
  for (const collection of collections) await exportCollection(collection);
  await out.writeFile('],"counts":' + JSON.stringify(counts) + ',"totalDocuments":' + total + '}\n');
  await out.sync();
  await out.close();
  await rename(temporary, destination);
  console.log(JSON.stringify({ destination, totalDocuments: total, collections: counts }, null, 2));
  console.log("Backup written. Verify counts and rehearse restore in an isolated project before relying on it.");
} catch (error) {
  await out.close().catch(() => {});
  await rm(temporary, { force: true }).catch(() => {});
  throw error;
}
