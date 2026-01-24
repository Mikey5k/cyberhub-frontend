const admin = require('firebase-admin');
require('dotenv').config();

console.log('Testing Firebase Admin initialization...');

// Get the base64 encoded service account from environment
const serviceAccountBase64 = process.env.FIREBASE_PRIVATE_KEY;

if (!serviceAccountBase64) {
  console.error('FIREBASE_PRIVATE_KEY not found in .env');
  process.exit(1);
}

console.log('Base64 length:', serviceAccountBase64.length);
console.log('First 100 chars:', serviceAccountBase64.substring(0, 100));

try {
  // Decode base64
  const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf-8');
  console.log('\nDecoded JSON length:', serviceAccountJson.length);
  console.log('First 200 chars of decoded:', serviceAccountJson.substring(0, 200));
  
  // Parse JSON
  const serviceAccount = JSON.parse(serviceAccountJson);
  console.log('\nParsed JSON keys:', Object.keys(serviceAccount));
  
  // Check for required fields
  const required = ['project_id', 'private_key', 'client_email'];
  const missing = required.filter(field => !serviceAccount[field]);
  
  if (missing.length > 0) {
    console.error('Missing fields:', missing);
  } else {
    console.log('All required fields present');
    console.log('Project ID:', serviceAccount.project_id);
    console.log('Client email:', serviceAccount.client_email);
    console.log('Private key length:', serviceAccount.private_key.length);
    console.log('Private key starts with:', serviceAccount.private_key.substring(0, 50));
  }
  
} catch (error) {
  console.error('Error:', error.message);
}