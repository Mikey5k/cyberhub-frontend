import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK - RAW JSON METHOD
if (!admin.apps.length) {
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    
    if (!serviceAccountJson) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set");
    }
    
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log("✅ Firebase Admin initialized from raw JSON");
    
  } catch (error: any) {
    console.error("❌ Firebase Admin initialization failed:", error.message);
  }
}

export const db = admin.firestore();
export const auth = admin.auth();