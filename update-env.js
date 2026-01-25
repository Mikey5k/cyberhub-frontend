const fs = require('fs');
const { execSync } = require('child_process');

console.log('Updating Vercel environment variable...');

// Read the base64 file
const base64Content = fs.readFileSync('C:/Users/Mike/Downloads/base64output.txt', 'utf8');
const lines = base64Content.split('\n');

// Remove first and last lines (BEGIN/END CERTIFICATE)
const cleanBase64 = lines.slice(1, -2).join('').trim();

console.log('Base64 length:', cleanBase64.length);
console.log('First 50 chars:', cleanBase64.substring(0, 50));

// Write to temp file for Vercel CLI
fs.writeFileSync('temp-base64.txt', cleanBase64);

console.log('\nUpdating Vercel environment variable...');

try {
  // Remove old env var
  console.log('Removing old FIREBASE_PRIVATE_KEY...');
  execSync('vercel env rm FIREBASE_PRIVATE_KEY production -y', { stdio: 'inherit' });
  
  // Add new env var
  console.log('Adding new FIREBASE_PRIVATE_KEY...');
  execSync(`echo ${cleanBase64} | vercel env add FIREBASE_PRIVATE_KEY production`, { stdio: 'inherit' });
  
  console.log('\n✅ Vercel environment variable updated!');
  console.log('Redeploying...');
  execSync('vercel deploy --prod', { stdio: 'inherit' });
  
} catch (error) {
  console.error('Error:', error.message);
}