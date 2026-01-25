const fs = require('fs');
const path = require('path');

console.log('Testing Firebase credentials...');

// Read .env file
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('.env.local not found at:', envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
console.log('Env file exists, size:', envContent.length);

// Extract FIREBASE_PRIVATE_KEY
const lines = envContent.split('\n');
const privateKeyLine = lines.find(line => line.startsWith('FIREBASE_PRIVATE_KEY='));

if (!privateKeyLine) {
  console.error('FIREBASE_PRIVATE_KEY not found in .env.local');
  process.exit(1);
}

const serviceAccountBase64 = privateKeyLine.replace('FIREBASE_PRIVATE_KEY=', '').trim();
console.log('\nBase64 extracted, length:', serviceAccountBase64.length);

// Try to decode
try {
  const decoded = Buffer.from(serviceAccountBase64, 'base64').toString('utf-8');
  console.log('\nSuccessfully decoded Base64');
  console.log('Decoded length:', decoded.length);
  console.log('First 200 chars:', decoded.substring(0, 200));
  
  // Try to parse as JSON
  const parsed = JSON.parse(decoded);
  console.log('\nSuccessfully parsed as JSON');
  console.log('Keys:', Object.keys(parsed));
  
  // Check critical fields
  if (parsed.private_key) {
    console.log('private_key exists, length:', parsed.private_key.length);
    console.log('Starts with:', parsed.private_key.substring(0, 30));
  }
  
  if (parsed.project_id) {
    console.log('project_id:', parsed.project_id);
  }
  
  if (parsed.client_email) {
    console.log('client_email:', parsed.client_email);
  }
  
} catch (error) {
  console.error('Error:', error.message);
}