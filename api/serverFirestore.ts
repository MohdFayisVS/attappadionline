import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function adminDb() {
  if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId) throw new Error("FIREBASE_PROJECT_ID is required");
    const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    initializeApp({
      projectId,
      credential: json ? cert(JSON.parse(json)) : applicationDefault()
    });
  }
  return getFirestore();
}

export function getServerFirestore() {
  return adminDb();
}

// Compatibility wrappers preserve the existing API call sites while replacing
// unauthenticated client SDK access with server-side Firebase Admin credentials.
export function collection(db: FirebaseFirestore.Firestore, name: string) {
  return db.collection(name);
}
export function doc(db: FirebaseFirestore.Firestore, name: string, id: string) {
  return db.collection(name).doc(id);
}
export async function getDocs(ref: FirebaseFirestore.CollectionReference) {
  return ref.get();
}
export async function getDoc(ref: FirebaseFirestore.DocumentReference) {
  return ref.get();
}
export async function setDoc(ref: FirebaseFirestore.DocumentReference, data: any) {
  await ref.set(data);
}
export async function deleteDoc(ref: FirebaseFirestore.DocumentReference) {
  await ref.delete();
}
