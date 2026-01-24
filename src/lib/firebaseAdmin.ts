import admin from "firebase-admin";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Get Base64 encoded service account JSON
    const serviceAccountBase64 = process.env.FIREBASE_PRIVATE_KEY;
    
    if (!serviceAccountBase64) {
      throw new Error("FIREBASE_PRIVATE_KEY environment variable is not set");
    }
    
    // Decode Base64 to JSON string
    const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf-8');
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log("✅ Firebase Admin initialized from Base64 JSON");
    
  } catch (error: any) {
    console.error("❌ Firebase Admin initialization error:", error.message);
  }
}

export const db = admin.firestore();
export const auth = admin.auth();