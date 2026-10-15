# Dependency security remediation — Phase 1

## CI finding (15 October 2026)

The GitHub Actions production audit (`npm audit --omit=dev --audit-level=high`) failed after TypeScript, security tests, and build passed. The audit reported 23 vulnerable package entries: 1 critical, 11 high, 11 moderate. These counts are package findings, not proof of exploitability in this application.

Important affected packages include:

| Package | Severity | Advisory or exposure | Next action |
| --- | --- | --- | --- |
| `proxy-addr` | Critical | IP spoofing with IPv4-mapped IPv6 trusted subnets (GHSA-jqcg-44mw-7w3h) | Upgrade patched transitive dependency; review proxy trust settings |
| `@grpc/grpc-js` | High | Certificate authorization and error disclosure advisories | Evaluate compatible Firebase / Google SDK dependency updates; **do not** accept an automatic Firebase major downgrade |
| `@fastify/busboy` | High | Multipart denial-of-service and CRLF injection | Update transitive dependency through its parent package |
| `fast-xml-parser` | High | Entity expansion limits bypass | Update transitive dependency |
| `brace-expansion`, `browserslist`, `nanoid`, `postcss`, `source-map-js` | High | Various DoS, parsing and source-map advisories | Upgrade to patched versions, distinguishing build-only from runtime dependencies |
| `body-parser`, `qs`, `protobufjs`, `uuid` | Moderate | Parser, DoS, and bounds-check advisories | Resolve with compatible updates |

## Safe remediation procedure

1. In a clean checkout of the draft branch, run `npm ci` and save `npm audit --json` and `npm audit --omit=dev --json` for exact dependency paths and fix candidates.
2. First try `npm audit fix --dry-run` and inspect the proposed package-lock changes. Do not run `npm audit fix --force` blindly: the current audit suggested a breaking Firebase downgrade.
3. Apply compatible, minimal dependency updates to **both** `package.json` and `package-lock.json`; use `npm overrides` only after checking semver and runtime compatibility. Avoid editing lockfile entries manually.
4. Run `npm ci`, `npm run lint`, `npm run test:security`, `npm run build`, and both audits. Verify Firebase login, Firestore read/write/delete, and public submissions in staging.
5. Keep the production audit gate blocking merges until high and critical production findings are resolved or a documented, time-bounded risk exception is approved.

**Do not deploy or merge this draft until remediation and staging validation are complete.**
