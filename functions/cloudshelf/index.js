const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');

admin.initializeApp();

// Store this in Firebase/Secret Manager. Never commit the value.
const CLOUDSHELF_API_KEY = defineSecret('CLOUDSHELF_API_KEY');
const CLOUDSHELF_API_URL = process.env.CLOUDSHELF_API_URL || '';

exports.cloudshelf = onRequest(
  { secrets: [CLOUDSHELF_API_KEY], cors: true },
  async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
    if (!CLOUDSHELF_API_URL) return res.status(503).json({ error: 'Cloudshelf API URL is not configured' });

    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' });

    try {
      const token = auth.slice(7);
      await admin.auth().verifyIdToken(token);
      const { action, payload = {} } = req.body || {};
      const allowed = new Set(['catalog', 'products', 'createCheckout', 'reportPurchase']);
      if (!allowed.has(action)) return res.status(400).json({ error: 'Unsupported action' });

      // TODO: map each action to the exact Cloudshelf GraphQL query/mutation
      // after the user's Cloudshelf account/API schema is available.
      return res.status(501).json({
        error: 'Cloudshelf action scaffold only',
        action,
        message: 'Configure the exact GraphQL operation before enabling production calls.'
      });
    } catch (error) {
      console.error(error);
      return res.status(401).json({ error: 'Invalid authentication' });
    }
  }
);
