# Tamil editorial coverage rollout

Tamil is the third editorial language (`ta`). Header, footer, navigation and all form controls remain in English.

## Storage
Editorial records across news, events, notices, directory, emergency, opinions, destinations, cultures, stays, travelogues, photos, bus routes, routes, autos, LPG and lost-and-found can have corresponding optional `*Ta` fields for each `*En` field. Existing `*En` and `*Ml` data must never be overwritten.

## Migration (administrator only)
POST `/api/admin/content/backfill-tamil` with an authenticated Firebase admin ID token, JSON `{"collection":"destinations","limit":2}`. Repeat for each collection in small batches, checking `remainingEstimate` and `failedIds`. The separate news endpoint `/api/admin/news/backfill-tamil` is also available.

Gemini must be configured server-side. Generated Tamil text requires editorial review for names, routes, public safety notices, schedules and local terminology. Never auto-publish safety-critical mistranslations.

## Important
The translation endpoint does not run by itself. Existing records remain English fallback until an admin runs backfill or manually enters Tamil fields. This is not proof of 100% coverage. Do not use this endpoint without checking production backup and quotas. Verify translations in each page after deployment. There is no guarantee of zero English fallback for legacy or missing fields.
