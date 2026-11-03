/**
 * Offline, non-destructive Firestore export -> D1 import SQL converter.
 * Keep input/output PRIVATE: exports can contain personal information.
 * Usage: npx tsx scripts/firestore-to-d1.ts private-backups/firestore-export.json private-backups/d1-import.sql
 * Run D1 import only after reviewing SQL and creating a fresh D1 database.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const [source, destination] = process.argv.slice(2);
if (!source || !destination) throw new Error("Usage: tsx scripts/firestore-to-d1.ts <private-backup.json> <private-import.sql>");
const input = resolve(source);
const output = resolve(destination);
if (input === output) throw new Error("Input and output paths must differ");
const backup = JSON.parse(await readFile(input, "utf8"));
if (backup.format !== "attappadi-firestore-export-v1" || !Array.isArray(backup.documents)) {
  throw new Error("Unsupported backup format");
}
if (backup.totalDocuments !== backup.documents.length) throw new Error("Backup document count mismatch");
const quote = (s: string) => "'" + s.replace(/'/g, "''") + "'";
const seen = new Set<string>();
const lines = [
  "-- Attappadi Online: portable document mirror for D1 read failover",
  "-- Private data. Import only to a restricted D1 database.",
  "BEGIN TRANSACTION;",
  "CREATE TABLE IF NOT EXISTS firestore_documents (path TEXT PRIMARY KEY, collection_path TEXT NOT NULL, document_id TEXT NOT NULL, payload_json TEXT NOT NULL, imported_at TEXT NOT NULL);",
  "CREATE INDEX IF NOT EXISTS idx_firestore_documents_collection ON firestore_documents(collection_path);",
];
for (const doc of backup.documents as {path:string;data:unknown}[]) {
  if (typeof doc.path !== "string" || !doc.path || seen.has(doc.path)) throw new Error("Invalid or duplicate document path");
  const parts = doc.path.split("/");
  if (parts.length < 2 || parts.length % 2 !== 0 || parts.some(p => !p)) throw new Error("Invalid Firestore path: " + doc.path);
  seen.add(doc.path);
  const json = JSON.stringify(doc.data);
  if (json === undefined) throw new Error("Missing document payload: " + doc.path);
  lines.push("INSERT INTO firestore_documents(path,collection_path,document_id,payload_json,imported_at) VALUES (" +
    [doc.path, parts.slice(0,-1).join("/"), parts.at(-1)!, json, backup.exportedAt || new Date().toISOString()].map(quote).join(",") +
    ") ON CONFLICT(path) DO UPDATE SET payload_json=excluded.payload_json, imported_at=excluded.imported_at;");
}
lines.push("COMMIT;");
await mkdir(dirname(output), { recursive: true, mode: 0o700 });
await writeFile(output, lines.join("\n") + "\n", { mode: 0o600, flag: "wx" });
console.log(JSON.stringify({ documents: seen.size, databaseId: backup.databaseId, destination: output, note: "SQL generated locally; no database modified." }));
