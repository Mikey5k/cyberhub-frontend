const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json'); // You need this file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'studio-4109137205-4e150'
});

const db = admin.firestore();

async function cleanupFirestore() {
  console.log('Starting Firestore cleanup...\n');

  // ========== USERS COLLECTION ==========
  console.log('Cleaning users collection...');
  const usersRef = db.collection('users');
  const usersSnapshot = await usersRef.get();
  
  let keptUsers = 0;
  let deletedUsers = 0;
  
  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    const userId = userDoc.id;
    
    // KEEP: Ronny Odhiambo (phone +254729626011)
    // KEEP: Your Gmail admin (onyangomike254@gmail.com)
    // KEEP: Admin email (admin@veritascyberhub.com)
    // DELETE: Everything else
    
    const shouldKeep = 
      userId.includes('254729626011') || // Ronny
      (userData.email && userData.email.includes('veritascyberhub.com')) || // Admin emails
      (userData.email && userData.email.includes('onyangomike254@gmail.com')); // Your Gmail
    
    if (shouldKeep) {
      console.log(`✅ KEEPING: ${userId} - ${userData.email || userData.phone || 'no contact'}`);
      keptUsers++;
      
      // Ensure Ronny has correct role if not admin
      if (userId.includes('254729626011') && userData.role !== 'admin') {
        await userDoc.ref.update({ role: 'user', status: 'active' });
        console.log(`   Updated Ronny's role to: user`);
      }
    } else {
      console.log(`❌ DELETING: ${userId} - ${userData.email || userData.phone || 'no contact'}`);
      await userDoc.ref.delete();
      deletedUsers++;
    }
  }
  
  console.log(`\nUsers: ${keptUsers} kept, ${deletedUsers} deleted\n`);

  // ========== JOBS COLLECTION ==========
  console.log('Cleaning jobs collection...');
  const jobsRef = db.collection('jobs');
  const jobsSnapshot = await jobsRef.get();
  
  let keptJobs = 0;
  let deletedJobs = 0;
  
  for (const jobDoc of jobsSnapshot.docs) {
    const jobData = jobDoc.data();
    const jobId = jobDoc.id;
    
    // KEEP: Only recent real jobs (created in last 7 days)
    // DELETE: All test/mock jobs
    const jobDate = new Date(jobData.createdAt || jobData.updatedAt || 0);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const shouldKeep = jobDate > sevenDaysAgo;
    
    if (shouldKeep) {
      console.log(`✅ KEEPING job: ${jobId} - ${jobData.title || 'Untitled'}`);
      keptJobs++;
    } else {
      console.log(`❌ DELETING job: ${jobId} - ${jobData.title || 'Untitled'}`);
      await jobDoc.ref.delete();
      deletedJobs++;
    }
  }
  
  console.log(`\nJobs: ${keptJobs} kept, ${deletedJobs} deleted`);

  // ========== SUMMARY ==========
  console.log('\n✅ CLEANUP COMPLETE!');
  console.log(`Total kept: ${keptUsers + keptJobs} items`);
  console.log(`Total deleted: ${deletedUsers + deletedJobs} items`);
  
  process.exit(0);
}

cleanupFirestore().catch(error => {
  console.error('❌ Cleanup failed:', error);
  process.exit(1);
});