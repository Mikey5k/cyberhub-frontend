export async function GET() {
  const firebaseConfig = {
    hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
    hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
    hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY ? 'YES' : 'NO',
    privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length || 0
  };
  
  return Response.json({
    status: "debug",
    firebaseConfig,
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV
  });
}