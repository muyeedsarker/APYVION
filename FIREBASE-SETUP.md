# Firebase Integration — APYVION

এই সংস্করণটি Firebase Web App-এর জন্য integration-ready। এটি নিজে থেকে আপনার Firebase project-এ connect হবে না যতক্ষণ না আপনি Web App config বসান।

## 1. Firebase project
1. Firebase Console-এ একটি project তৈরি/নির্বাচন করুন।
2. Project settings → Your apps → Web app তৈরি করুন।
3. Web App-এর config values `firebase-config.js`-এ বসান।
4. **Service-account private key / Admin SDK JSON কখনো frontend-এ রাখবেন না।**

## 2. Authentication
Firebase Authentication-এ Email/Password provider চালু করুন।

## 3. Firestore
Firestore Database তৈরি করুন এবং প্রয়োজন অনুযায়ী collections যোগ করুন। এই package-এর starter rules owner-scoped data-এর উদাহরণ দেয় এবং default-deny রাখে। Production collections-এর জন্য আলাদা explicit rules লিখুন।

## 4. Storage
User file upload দরকার হলে Firebase Storage চালু করুন। `storage.rules` user-folder owner access-এর starter rule দেয়।

## 5. Generated apps
App Builder এখন generated frontend-এ Firebase client adapter যোগ করার জন্য প্রস্তুত করা হয়েছে। Authentication প্রয়োজন হলে generated login flow Firebase Auth-এর দিকে নেওয়া যাবে।

## 6. Important
- Firebase Web API key frontend-এ থাকা স্বাভাবিক; এটি password বা service-account secret নয়। নিরাপত্তা Firestore/Storage Rules, Auth, App Check এবং backend authorization দিয়ে enforce করুন।
- Production-এ payment verification, admin operations এবং privileged actions-এর জন্য trusted server/Cloud Functions ব্যবহার করুন।
