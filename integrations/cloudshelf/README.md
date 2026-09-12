# Cloudshelf integration structure

This folder provides a safe integration boundary for the APYVION.

## Architecture

Browser UI -> Firebase Auth -> Firebase Functions/backend -> Cloudshelf GraphQL API

The browser must never contain the Cloudshelf API key. Cloudshelf requires an API-key token in the Authorization header, so credentials belong in server-side environment/secret storage.

## Intended responsibilities

- `cloudshelf-client.js`: browser-safe adapter; sends approved actions to the backend.
- `functions/cloudshelf/`: server-side GraphQL adapter and action routing.
- Firebase Auth: identifies the signed-in user.
- Firestore: stores application-side product/order/check-out metadata as appropriate.

This package intentionally does not include real credentials or live API calls.
