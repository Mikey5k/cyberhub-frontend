export async function GET() {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
  
  return Response.json({
    hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
    hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
    hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
    privateKeyLength: privateKey.length,
    privateKeyFirst50: privateKey.substring(0, 50),
    privateKeyLast50: privateKey.substring(privateKey.length - 50),
    containsNewlines: privateKey.includes('\n'),
    containsEscapedNewlines: privateKey.includes('\\n')
  });
}