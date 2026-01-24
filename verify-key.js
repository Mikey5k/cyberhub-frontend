const admin = require('firebase-admin');
const fs = require('fs');

console.log('Testing Firebase Admin with local JSON file...');
const serviceAccount = require('C:/Users/Mike/Downloads/studio-4109137205-4e150-d2cce05b84ff.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
db.collection('services').limit(1).get()
  .then(snap => console.log('✅ SUCCESS: Found', snap.size, 'services'))
  .catch(err => console.error('❌ FAILED:', err.message));