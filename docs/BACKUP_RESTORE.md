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
