const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

let firebaseApp = null;

function initFirebase() {
  if (firebaseApp) return firebaseApp;

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json';
  const absolutePath = path.resolve(process.cwd(), serviceAccountPath);

  try {
    const serviceAccount = require(absolutePath);
    firebaseApp = admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    return firebaseApp;
  } catch (err) {
    console.warn('Firebase init skipped - service account not found:', absolutePath);
    return null;
  }
}

function getMessaging() {
  const app = initFirebase();
  return app ? admin.messaging() : null;
}

module.exports = { initFirebase, getMessaging };
