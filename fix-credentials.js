const fs = require('fs');
const path = require('path');

console.log('=== FIREBASE CREDENTIAL FIX ===\n');

// 1. Load the new JSON file
const jsonPath = 'C:/Users/Mike/Downloads/studio-4109137205-4e150-d2cce05b84ff.json';
const serviceAccount = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log('1. Service Account Details:');
console.log('   Project ID:', serviceAccount.project_id);
console.log('   Client Email:', serviceAccount.client_email);
console.log('   Private Key ID:', serviceAccount.private_key_id);
console.log('   Key exists:', !!serviceAccount.private_key);

// 2. Extract private key and fix formatting
const privateKey = serviceAccount.private_key;
console.log('\n2. Private Key Analysis:');
console.log('   Length:', privateKey.length);
console.log('   Has BEGIN line:', privateKey.includes('-----BEGIN PRIVATE KEY-----'));
console.log('   Has END line:', privateKey.includes('-----END PRIVATE KEY-----'));
console.log('   Newline count:', (privateKey.match(/\n/g) || []).length);

// 3. Create PROPERLY formatted env var value
// Single line with escaped \n for env var
const formattedForEnv = privateKey.replace(/\n/g, '\\n');
console.log('\n3. Formatted for Environment Variable:');
console.log('   First 100 chars:', formattedForEnv.substring(0, 100));

// 4. Save to files
fs.writeFileSync('private-key-raw.txt', privateKey);
fs.writeFileSync('private-key-for-env.txt', formattedForEnv);

console.log('\n4. Files created:');
console.log('   private-key-raw.txt - Raw key (with actual newlines)');
console.log('   private-key-for-env.txt - For Vercel env var (with \\n)');

// 5. Test locally
console.log('\n5. Local test command:');
console.log('   copy this for Vercel:');
console.log('   ', formattedForEnv.substring(0, 100) + '...');