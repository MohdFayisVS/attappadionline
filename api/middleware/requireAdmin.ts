import type { Request, Response, NextFunction } from "express";
import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

/**
 * Server-side authorization for privileged API operations.
 * Configure FIREBASE_PROJECT_ID and ADMIN_UIDS (comma-separated Firebase Auth UIDs).
 * Never trust a token supplied by the client without signature verification.
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const allowedUids = new Set((process.env.ADMIN_UIDS || "").split(",").map(x => x.trim()).filter(Boolean));
  if (!projectId || allowedUids.size === 0) {
    res.status(503).json({ error: "Admin authentication is not configured" });
    return;
  }
  const header = req.get("authorization") || "";
  const match = /^Bearer (\S+)$/i.exec(header);
  if (!match) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  try {
    if (!getApps().length) initializeApp({ credential: applicationDefault(), projectId });
    const token = await getAuth().verifyIdToken(match[1], true);
    if (!allowedUids.has(token.uid)) {
      res.status(403).json({ error: "Administrator permission required" });
      return;
    }
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired authentication" });
  }
}
