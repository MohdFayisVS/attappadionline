import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const adminAuth = getAuth(app);
export { signInWithEmailAndPassword, signOut, onAuthStateChanged };

/** Fetch protected API operations with a fresh, server-verified Firebase ID token. */
export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const user = adminAuth.currentUser;
  const headers = new Headers(init.headers);
  if (user) headers.set("Authorization", `Bearer ${await user.getIdToken()}`);
  return fetch(input, { ...init, headers });
}
