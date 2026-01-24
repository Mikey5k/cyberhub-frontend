import admin from "firebase-admin";

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    // Get environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("Missing Firebase environment variables");
    }

    // Clean up the private key - remove quotes and fix newlines
    let cleanedPrivateKey = privateKey;
    
    // Remove surrounding quotes if present
    if (cleanedPrivateKey.startsWith('"') && cleanedPrivateKey.endsWith('"')) {
      cleanedPrivateKey = cleanedPrivateKey.slice(1, -1);
    }
    
    // Replace escaped newlines with actual newlines
    cleanedPrivateKey = cleanedPrivateKey.replace(/\\n/g, '\n');
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: cleanedPrivateKey
      }),
    });
    
    console.log("✅ Firebase Admin initialized successfully from env vars");
  } catch (error: any) {
    console.error("❌ Firebase Admin initialization error:", error.message);
    console.error("Error details:", error);
    // Don't throw - allow app to continue in limited mode
  }
}

export const db = admin.firestore();
export const auth = admin.auth();