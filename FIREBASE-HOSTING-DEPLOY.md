# APYVION — Firebase Hosting Deployment

## 1. Set the Firebase project
Replace `YOUR_FIREBASE_PROJECT_ID` in `.firebaserc` with your real Firebase project ID.

## 2. Firebase CLI
From the ZIP root:

```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only hosting
```

The deployed site will be available on Firebase's `web.app` and `firebaseapp.com` subdomains for the selected project.

## 3. Optional: deploy Firebase rules/indexes too

```bash
firebase deploy --only hosting,firestore,storage
```

Review the rules before production deployment.

## 4. GitHub automatic deployment
The included `.github/workflows/firebase-hosting.yml` deploys the `main` branch.
Add these GitHub repository secrets:

- `FIREBASE_PROJECT_ID` — your Firebase project ID
- `FIREBASE_TOKEN` — a Firebase CI token

For a more modern GitHub setup, prefer Firebase's official GitHub integration (`firebase init hosting:github`) so Firebase creates and manages the deployment credentials.

## 5. Firebase Web App configuration
Edit `firebase-config.js` (repo root) and place the Firebase Web App configuration from Firebase Console there. Do not put server/service-account secrets in browser code.

## 6. Cloudshelf
Keep Cloudshelf API credentials server-side. Do not place API keys in `assets/*.js`. Hosting serves the static frontend; protected Cloudshelf operations should go through a trusted backend/Cloud Functions boundary.
