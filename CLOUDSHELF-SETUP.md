# APYVION — Cloudshelf/Firebase integration setup

## What is included

- Browser-safe `integrations/cloudshelf/cloudshelf-client.js`
- Firebase Functions server boundary under `functions/cloudshelf/`
- Secret placeholder for `CLOUDSHELF_API_KEY`
- Action routing for catalog, products, checkout and purchase reporting
- No live credentials and no destructive changes to the existing UI

## Security rule

Do **not** paste a Cloudshelf API key into HTML, CSS, browser JavaScript, GitHub, or this ZIP. Cloudshelf API authentication belongs on the server.

## Firebase setup

1. Install/use Firebase CLI and authenticate.
2. In the Firebase project, configure the Functions runtime.
3. Store the API key as a Firebase secret named `CLOUDSHELF_API_KEY`.
4. Set `CLOUDSHELF_API_URL` to the exact GraphQL endpoint supplied by Cloudshelf for your account/connector.
5. Deploy Functions.
6. Set the browser `CLOUDSHELF_FUNCTION_URL` to the deployed HTTPS function URL.
7. Test with a Firebase-authenticated account.

## Important

The scaffold deliberately stops before live GraphQL mutations. The exact queries/mutations depend on the Cloudshelf account/API schema and the e-commerce use case. Do not enable production checkout until those operations and webhook handling have been verified.
