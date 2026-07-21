import admin from 'firebase-admin';
import fs from 'fs';

let initialized = false;

function ensureFirebaseInitialized() {
  if (initialized) return;
  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json';
  if (!fs.existsSync(keyPath)) {
    throw new Error(
      `Firebase service account file not found at "${keyPath}". ` +
        `Download it from Firebase Console → Project Settings → Service Accounts, ` +
        `or set REQUIRE_AUTH=false in .env to skip verification during development.`
    );
  }
  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf-8'));
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  initialized = true;
}

/**
 * Verifies the Firebase ID token sent by the frontend as
 * `Authorization: Bearer <token>`. Set REQUIRE_AUTH=false in .env to
 * bypass this during early development (e.g. before you've set up a
 * Firebase service account) — re-enable before your final demo.
 */
export async function verifyAuth(req, res, next) {
  const requireAuth = process.env.REQUIRE_AUTH !== 'false';

  if (!requireAuth) {
    req.user = { uid: 'dev-mode', email: 'dev@local' };
    return next();
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing Authorization: Bearer <token> header' });
  }

  try {
    ensureFirebaseInitialized();
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email };
    next();
  } catch (err) {
    res.status(401).json({ error: `Invalid or expired token: ${err.message}` });
  }
}