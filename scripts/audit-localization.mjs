/**
 * Static localization inventory for the Attappadi Online public frontend.
 * Run: node scripts/audit-localization.mjs
 * Reports likely omissions; manual review is still required for all content.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
const root = new URL('../src/', import.meta.url).pathname;
const files = [];
function walk(dir) {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    if (item.name === 'node_modules') continue;
    const full = join(dir, item.name);
    if (item.isDirectory()) walk(full);
    else if (/\.(tsx|ts|css)$/.test(item.name)) files.push(full);
  }
}
walk(root);
const findings = [];
for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n');
  const path = relative(root, file);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const reason = [];
    if (/font-anek-malayalam/.test(line) && !/lang\s*===|lang\s*==|language\s*===|font-anek-tamil|font-anek-english|font-anek-latin|\[lang=/.test(line)) reason.push('unconditional Malayalam font');
    if (/lang\s*===\s*["']ta["']/.test(line) && /\|\|\s*\w+\.(?:\w+En|\w+Ml)/.test(line)) reason.push('Tamil fallback to another language');
    if (/[\u0D00-\u0D7F]/.test(line) && !/[\u0B80-\u0BFF]/.test(line) && !/lang\s*===\s*["']ml["']/.test(line) && !/(?:nameMl|titleMl|descMl|descriptionMl|locationMl|routeMl|guideMl|typeMl|contentMl|subtitleMl|highlightsMl|runsMl|frequencyMl|timingsMl|busTypeMl|headingToMl|priceMl|snippetMl|authorMl|readTimeMl|elementMl|labelMl|stopMl|viaCodeMl)\s*:/.test(line)) reason.push('Malayalam text without visible Tamil branch');
    if (reason.length) findings.push({ file: path, line: i + 1, reason: reason.join('; '), excerpt: line.trim().slice(0, 150) });
  }
}
console.log(JSON.stringify({ scannedFiles: files.length, findings: findings.length, details: findings }, null, 2));
if (findings.length) process.exitCode = 1;
