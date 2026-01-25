const fs = require('fs');
const path = require('path');

const jsonPath = 'C:/Users/Mike/Downloads/studio-4109137205-4e150-firebase-adminsdk-fbsvc-6b5af755dc.json';
const jsonContent = fs.readFileSync(jsonPath, 'utf8');
const serviceAccount = JSON.parse(jsonContent);

console.log('Project ID:', serviceAccount.project_id);
console.log('Client Email:', serviceAccount.client_email);
console.log('\n--- PRIVATE KEY ---');
console.log(serviceAccount.private_key);
console.log('--- END PRIVATE KEY ---');

// Save to file
fs.writeFileSync('private-key-clean.txt', serviceAccount.private_key);
console.log('\nSaved to private-key-clean.txt');