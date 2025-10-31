import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccount = JSON.parse(readFileSync(path.join(__dirname, '..', 'firebase-service-account.json'), 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'rajesh-sweet-stall'
});

const db = admin.firestore();

async function testFirestore() {
  try {
    console.log('Testing Firestore access...');
    const testDoc = await db.collection('test').doc('test').set({ test: true });
    console.log('Firestore write successful');
    const readDoc = await db.collection('test').doc('test').get();
    console.log('Firestore read successful:', readDoc.data());
    await db.collection('test').doc('test').delete();
    console.log('Firestore delete successful');
    console.log('All tests passed!');
  } catch (error) {
    console.error('Firestore test failed:', error);
  }
}

testFirestore();
