# Phase 1 — Administrator authorization (DRAFT, DO NOT MERGE)

## Implemented in this branch
- Server-side Firebase ID token signature and revocation verification.
- UID allowlist from `ADMIN_UIDS` and fail-closed behavior when not configured.
- Protection for admin endpoints, diagnostics and content mutation routes.
- Retirement of the committed static admin password/token login.

## Blocking work before merge
1. Firebase email/password sign-in and token-aware dashboard requests are implemented in source, but **not yet validated in staging**. Confirm the existing Firebase project has Email/Password sign-in enabled and administrator UIDs provisioned.
2. Configure Firebase Admin application default credentials securely in staging; never commit service-account JSON.
3. Set `FIREBASE_PROJECT_ID` and `ADMIN_UIDS` in staging secrets. Provision admin accounts out of band and verify UIDs.
4. Review public exceptions: `POST /api/news/:id/view`, `POST /api/lostfound`, and `POST /api/lostfound/resolve/:id` for rate limits and abuse prevention. Validate the ownership model for lost/found resolution.
5. Review the route inventory for any other public write paths that need exceptions and test public reads.
6. Add authorization tests (401 no token, 403 non-admin, 200 admin, 503 misconfigured), UI end-to-end tests, and build checks.
7. Rotate exposed credentials and revoke old access outside the repository; review history and access logs.
8. Resolve Firestore error swallowing, startup deletion, and backup issues in follow-on PRs before a full production release.

## Safety
- No production data migration or Firestore writes performed by this PR preparation.
- Do not deploy this draft as-is: legacy admin UI has not been migrated.
- Review and test against isolated staging before merging.

## Frontend environment configuration (staging)
Set `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, and `VITE_FIREBASE_APP_ID` for the Vite frontend. These Firebase web identifiers are not service-account secrets. Configure backend `FIREBASE_PROJECT_ID`, `ADMIN_UIDS`, and secure Application Default Credentials separately. Never expose service-account credentials through `VITE_` variables.

## Current validation status
GitHub source updates committed; build, integration tests, and staging sign-in have not been executed. Keep PR in draft.
