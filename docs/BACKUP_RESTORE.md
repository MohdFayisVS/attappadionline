# Firestore backup and recovery — production release checklist

## Current limitations
The application's local db.json snapshot is a best-effort cache, **not** a durable disaster-recovery backup. Serverless temporary storage can disappear between requests and does not provide point-in-time restore.

## Before enabling production changes
1. Identify the actual Firebase project and Firestore database ID in the deployment environment.
2. Create a separate Google Cloud Storage bucket for managed Firestore exports, with restricted IAM and retention.
3. Configure scheduled managed exports (or equivalent supported managed backup/PITR policy), monitor failures, and set alerts.
4. Verify that backups contain expected collections and metadata. Never assume a successful scheduler invocation proves recoverability.
5. Perform a restore rehearsal into an isolated staging project or database, confirm document counts and sample content, and document recovery time.
6. Define recovery point and recovery time objectives, retention period, and accountable operator.
7. Require a separately approved, dry-run-reviewed migration for any future cleanup. Do not delete content automatically on startup.

## Operational safety
- No backup or export has been configured by this repository-only change.
- No production credentials or database operations were used.
- Keep deployment blocked until authentication and persistence failure behavior are tested.

## Release gate (15 October 2026)

- Independent CI validation passed for the patched dependency lockfile (run 38698400761).
- **BLOCKER:** `firestore.rules` currently allows unauthenticated `read, write: if true` for multiple content collections. Server-side API authorization does not protect direct Firebase client SDK access. Before publishing hardened rules, inventory all browser Firestore reads and writes, migrate legitimate operations to the authenticated API or narrowly scoped rules, and test in the Firestore Emulator. Do not publish a blanket deny rule without checking production read paths.
- **BLOCKER:** A real managed Firestore export/backup and tested restore have not been demonstrated.
- **BLOCKER:** Vercel production project ownership, environment variables (`ADMIN_UIDS`, Firebase credentials), deployment linkage, and rollback method are unverified. Repository `vercel.json` alone does not prove deployment access.
- **BLOCKER:** Production Firebase administrator sign-in, authorized and unauthorized API requests, and non-destructive public submission flows have not been exercised against the production environment.

Keep PR #1 unmerged and do not deploy until the blockers are resolved. Do not use real public submissions or modify production content merely to satisfy test coverage.
