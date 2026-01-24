import admin from "firebase-admin";

// Initialize Firebase Admin SDK - 3 VAR METHOD
if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("Missing Firebase environment variables");
    }

    // CRITICAL: Replace escaped newlines with actual newlines
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: formattedPrivateKey
      })
    });
    
    console.log("✅ Firebase Admin initialized (3-var method)");
    
  } catch (error: any) {
    console.error("❌ Firebase Admin initialization failed:", error.message);
    console.error("Error details:", error);
  }
}

export const db = admin.firestore();
export const auth = admin.auth();