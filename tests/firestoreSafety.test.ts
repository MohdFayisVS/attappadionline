import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../api/index.ts", import.meta.url), "utf8");

test("startup has no automatic legacy document purge", () => {
  assert.equal(source.includes("purgeLegacySampleData"), false);
});

test("cross-request pending write queue is absent", () => {
  assert.equal(source.includes("pendingWrites"), false);
});

test("Firestore helper errors are propagated", () => {
  assert.match(source, /Firestore direct write failed[\s\S]*?throw err;/);
  assert.match(source, /Firestore direct delete failed[\s\S]*?throw err;/);
});

test("content mutation paths return service unavailable on failed persistence", () => {
  assert.match(source, /Database operation failed; no changes were saved/);
});
