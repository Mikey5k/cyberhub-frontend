import admin from "firebase-admin";

let db: any = null;
let auth: any = null;

try {
  // Check if we have the required environment variables
  const hasValidConfig = 
    process.env.FIREBASE_PROJECT_ID && 
    process.env.FIREBASE_CLIENT_EMAIL && 
    process.env.FIREBASE_PRIVATE_KEY;
  
  if (hasValidConfig && !admin.apps.length) {
    // Clean the private key
    const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY || '';
    const cleanPrivateKey = rawPrivateKey
      .replace(/^"(.*)"$/, '$1')  // Remove quotes
      .replace(/\\n/g, '\n');     // Convert \n to actual newlines
    
    // Validate the cleaned key
    const isValidKey = cleanPrivateKey.includes('-----BEGIN PRIVATE KEY-----') &&
                      cleanPrivateKey.includes('-----END PRIVATE KEY-----') &&
                      cleanPrivateKey.length > 200;
    
    if (isValidKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: cleanPrivateKey,
        }),
      });
      
      db = admin.firestore();
      auth = admin.auth();
      console.log("✅ Firebase Admin initialized successfully");
    } else {
      console.log("⚠️ Firebase Admin: Invalid private key format, running in mock mode");
    }
  } else {
    console.log("⚠️ Firebase Admin: Missing environment variables, running in mock mode");
  }
} catch (error: any) {
  console.log("⚠️ Firebase Admin: Initialization error, running in mock mode:", error.message);
}

export { db, auth };
export const adminInstance = admin;