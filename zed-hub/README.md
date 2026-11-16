# ZED HUB — Luxury Full-Stack Storefront & Firebase Admin Studio

## 1. Prerequisites
- Node.js 18+ and npm 9+
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project on console.firebase.google.com

## 2. Installation
```bash
npm install
cp .env.example .env
```
Fill `.env` with your Firebase Web App credentials from Firebase Console -> Project Settings.

## 3. Firebase Backend Setup (Required)
1. Authentication: Enable Email/Password provider in Firebase Auth. Create your admin user and copy their UID.
2. Cloud Firestore: Create a Firestore database in production mode.
3. Register Admin Document: In Firestore, create collection `admins`, document ID `<YOUR_ADMIN_UID>`:
   ```json
   {
     "email": "admin@yourdomain.com",
     "displayName": "ZED Chief Admin",
     "role": "super_admin",
     "active": true
   }
   ```
4. Firebase Storage: Enable Storage in Firebase Console.
5. Deploy Rules & Composite Indexes:
   ```bash
   firebase login
   firebase use --add
   firebase deploy --only firestore:rules,firestore:indexes,storage:rules
   ```

## 4. Development & Build
```bash
npm run dev
npm run lint
npm run build
```

## 5. Hosting
- Firebase Hosting: `firebase deploy --only hosting`
- Vercel / Netlify / Cloudflare Pages: Build command `npm run build`, Output directory `dist`, SPA fallback to `index.html`, set `VITE_FIREBASE_*` env vars.

## 6. Firebase Quotas & Scaling
- Uses TTL caching, WebP image compression, route lazy loading, and paginated Firestore queries.
- Free Spark tier has daily read/write caps; upgrade to Blaze for high traffic. Neither plan guarantees unlimited traffic or zero loading time.
