const fs = require('fs');
const { execSync } = require('child_process');

console.log('Updating Vercel environment variable programmatically...');

// Read the formatted key
const formattedKey = fs.readFileSync('private-key-for-env.txt', 'utf8').trim();
console.log('Key length:', formattedKey.length);
console.log('First 80 chars:', formattedKey.substring(0, 80));

// Update Vercel
try {
  console.log('\n1. Removing old env var...');
  execSync('vercel env rm FIREBASE_PRIVATE_KEY production -y', { stdio: 'inherit' });
  
  console.log('\n2. Adding new env var...');
  // Pipe the key to vercel command
  const { spawn } = require('child_process');
  const vercel = spawn('vercel', ['env', 'add', 'FIREBASE_PRIVATE_KEY', 'production'], { stdio: 'pipe' });
  
  vercel.stdin.write(formattedKey);
  vercel.stdin.end();
  
  vercel.stdout.on('data', (data) => console.log(data.toString()));
  vercel.stderr.on('data', (data) => console.error(data.toString()));
  
  vercel.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ Vercel env var updated successfully!');
      console.log('\n3. Deploying changes...');
      execSync('git add src/lib/firebaseAdmin.ts', { stdio: 'inherit' });
      execSync('git commit -m "Use 3-var Firebase credential method"', { stdio: 'inherit' });
      execSync('git push', { stdio: 'inherit' });
    } else {
      console.error('\n❌ Failed to update env var');
    }
  });
  
} catch (error) {
  console.error('Error:', error.message);
}