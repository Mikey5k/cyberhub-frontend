const admin = require('firebase-admin');
const fs = require('fs');

console.log('Testing Firebase Admin locally...');

// Use the actual values from .env.local
const projectId = 'studio-4109137205-4e150';
const clientEmail = 'firebase-adminsdk-fbsvc@studio-4109137205-4e150.iam.gserviceaccount.com';
const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCQLqQyjC/smDkb
Pq3hg85/SePl1HyqyDBNA65Y0bch/AtKuIFd74R78jKbVY4ThYaIJBjK0ZjEYyOy
O/Hrc19HUR1YZI76oEIGvHlbr0wW/TkWDrC08kGGBH44xB6WbEOqulGsWvQnw/wg
QJYr++zA54adMFxcOpMmIIQmgYijdl4Jx45m9uLKBpccHmhRP9VYHuJAcdBuNK/5
is7yXyGrh42CQtV3xQoqCSSx4KEnxbgjmqtEdZnsKaJch/lIjEFczmifLElfHYPu
Er6ZQXNwui58DoOO0tib0NLekHDWOBBRAqgMH+rnw+hTks/bIpgcQBIBNWwz85gQ
uFJCw2KPAgMBAAECggEAJ6n9F77DDFZQF3OlyA1HiHLeVAKhjSXnS7iAhQSkWaAJ
xzN8u0fB7YsSavMdU7d+7ALqIxmH6jbPwh+FjN0/T9I7vW5kewQNRechh5xw1T4y
LyQ5bn3akrC3vIwPUhhUgSoif8TBuBLNUF4UMeNrHSJUQPfl4KVoh6uYTzOBUF49
BwsBJHHPfYGdygfYFG3jBgLUbKO2Cqp9++/YNyjXmhkllhza1R7owis11Kqxv7F5
gP31w38Uxu2P4Nhx+pj7WOsjMNNGLvW4QKMcKqv88cvIy8UBgPx1kVt2A2AYuSUY
6yIDMcqFWOfm3KARjRakv5KFqSL90Y1Rd95piV5YQQKBgQDC64OgxYUaoBvO7ULN
unu/KO5oRGqpG01VtgU3iDykwC+CKXwb0nE1fiL8VG81ExcESzft+HzCYsipnXKv
ImeBpLdROUgM+Bst9Bailwywrwxy9zW46naUZx9q3GCCLqQu7Kq7Q4yYf5OW9TvT
hxpID8Bl3w23fiftrQXf4u8EYQKBgQC9XPDYYc283uonKt9+L7UkfAnONVWm8TRj
li286j2KhevruJ2XJ+wpvRhLqpSlFe3F8VsTRG80LEwZ8/FW4pytZ0K5dKb61za2
1uD9z0j4zWWerBUbRBqD/ez7QhGLU6XbHNKEdrTCZ8X/Fwu9pm2yxhgyzgsJvgd8
tR4oQcHM7wKBgQCURc1aNgZ7a4Hb1bX0gz/w+TTp0emE/ATHB3BOfu8KsDsze1Uy
YNHHTE1Wvu/dYskmdgV0m4pj3/ses2ty9+vevarJOZaqbu1V9pBlXBvGJ1KD/bM7
F/feCdfnVP6A6PPx0gxJ6SeBNcLSmXfJ/8KpQHotxBBOHcRH009dsOX64QKBgBNC
wtSfjhep7NMzDyx8mcYuP6kTz7R9UEDY46oVgVD3sjl1u8HGM8VDEJeRsDDifB7o
H8Vj7pO19b+mCmQ2BI22tRi7/sgA3/XVAWmPjfKQocdz5WmykaffSh18aOBtD6+r
zNXgZR5pA8CgjXcq2HmYoJl6T7Eb/RL4MSsTFS1NAoGAX/mBtammBEx5NKpXZ3dz
sNBVai5S3Ur/hQV+Ns11xq8KujPsjUKG4B0Inw96KWEyO9NXU9DoayK6kn0bXzp8
2zCRdBZcMwFfrY6nb2Eg3sFcRH648GELEmybVH6Ru7jGON8Pygw7KadRUrcJp+7W
lbAxPd2aXu2FduZah7JM9T8=
-----END PRIVATE KEY-----`;

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey
    }),
  });
  
  console.log('✅ Firebase Admin initialized successfully locally');
  
  // Test Firestore
  const db = admin.firestore();
  const testDoc = await db.collection('services').doc('test').get();
  console.log('Test doc exists:', testDoc.exists);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Full error:', error);
}