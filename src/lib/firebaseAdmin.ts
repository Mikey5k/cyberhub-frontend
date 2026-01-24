import admin from "firebase-admin";

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    // Check if we have the service account JSON as base64 string
    const serviceAccountBase64 = process.env.FIREBASE_PRIVATE_KEY;
    
    if (!serviceAccountBase64) {
      throw new Error("FIREBASE_PRIVATE_KEY environment variable is not set");
    }
    
    // Decode base64 to JSON string, then parse
    const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf-8');
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    // Extract individual fields for Firebase
    const firebaseConfig = {
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key.replace(/\\n/g, '\n')
    };
    
    admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
    });
    
    console.log("✅ Firebase Admin initialized successfully");
  } catch (error: any) {
    console.error("❌ Firebase Admin initialization error:", error.message);
    console.error("Error details:", error);
    // Don't throw - allow app to continue in limited mode
  }
}

export const db = admin.firestore();
export const auth = admin.auth();