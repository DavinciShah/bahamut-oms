'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`,
});

let firebaseAdmin = null;

function getFirebase() {
  if (!firebaseAdmin) {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      return null;
    }
    const admin = require('firebase-admin');
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseAdmin = admin;
  }
  return firebaseAdmin;
}

const pushService = {
  async registerToken(userId, token) {
    await pool.query(
      `INSERT INTO push_tokens (user_id, token, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id, token) DO UPDATE SET updated_at = NOW()`,
      [userId, token]
    );
    return { registered: true };
  },

  async sendPush(userId, title, body, data = {}) {
    const admin = getFirebase();
    if (!admin) {
      console.warn('[pushService] Firebase not configured – skipping push for user', userId);
      return { skipped: true };
    }

    let tokens;
    try {
      const { rows } = await pool.query(
        'SELECT token FROM push_tokens WHERE user_id = $1',
        [userId]
      );
      tokens = rows.map((r) => r.token);
    } catch {
      console.warn('[pushService] push_tokens table not available');
      return { skipped: true };
    }

    if (!tokens.length) return { sent: 0 };

    const message = {
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
      tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    return { sent: response.successCount, failed: response.failureCount };
  },
};

module.exports = pushService;
