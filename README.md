# Vågen

Personal calorie, weight and training log. A single-page web app that installs to the home screen, works offline and syncs between devices through your own free Firebase project.

## 1. Put it on GitHub Pages

1. Copy all files in this folder into your local `vagen` repo (keep the folder structure, including the hidden `.nojekyll` file).
2. In that folder:
   ```
   git add .
   git commit -m "Vågen"
   git push
   ```
3. On github.com → the `vagen` repo → **Settings → Pages** → Source: *Deploy from a branch*, Branch: `main`, folder `/ (root)` → Save.
4. After a minute the app is at `https://<username>.github.io/vagen/`.

The page itself is public (GitHub Pages on a free plan always is). Your log is not: it lives in Firestore behind your login.

## 2. Create the Firebase project (once, about 10 minutes)

1. Go to <https://console.firebase.google.com> → **Create a project** → name it `vagen` → Google Analytics can be turned off → Create.
2. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable** (leave "Email link" off) → Save.
3. **Authentication → Settings → Authorized domains → Add domain** → `<username>.github.io`.
4. **Build → Firestore Database → Create database** → pick location `eur3 (europe-west)` → *Start in production mode* → Create.
5. **Firestore → Rules** → replace everything with the contents of `firestore.rules` → **Publish**.
6. **Project settings (gear icon) → General → Your apps → Web (`</>`)** → nickname `vagen` → leave Hosting unchecked → Register app.
7. Copy the `const firebaseConfig = { ... }` block that is shown.

Then either:
- paste that block into the app's first screen (stored on that device only; you'd paste it once per device), or
- put it in `firebase-config.js` as `window.VAGEN_FIREBASE = { apiKey: "...", ... };`, bump `VERSION` in `sw.js`, and push. Every device then picks it up automatically. **Recommended.**

These config values are not secret; every Firebase web app ships them to the browser. The rules are what protect the data.

## 3. First start

1. Open the site on the phone → **Create account** with your email and a password.
2. Plan → **Import backup** → choose `vagen-backup-2026-10-27.json` to bring over the entries from the Claude artifact version.
3. Add to home screen: iPhone Safari → Share → *Add to Home Screen*; Android Chrome → ⋮ → *Install app*.

Optional: once your account exists, stop anyone else from creating accounts in your project: Firebase → Authentication → Settings → **User actions** → untick *Enable create (sign-up)*.

## Updating the app

Whenever files change, bump `VERSION` in `sw.js` (e.g. `vagen-2026-11-02-1`) before pushing, so installed copies fetch the new files. Open the app twice to see the update.

## Files

| Path | What it is |
|---|---|
| `index.html` | The whole app |
| `firebase-config.js` | Your Firebase web config (or `null` to ask on first start) |
| `firestore.rules` | Security rules: each user can only read and write `users/<their uid>/…` |
| `sw.js` | Offline cache |
| `manifest.webmanifest`, `icons/` | Home-screen install |
| `data/livsmedel.json` | Livsmedelsverket food database (CC BY 4.0) |
| `data/off-se.json` | Swedish products from Open Food Facts (ODbL) |
| `vendor/` | Firebase SDK 12.19.0 and ZXing 0.23.0 (barcode reader for browsers without a built-in one) |

Barcode lookups not in `off-se.json` go live to the Open Food Facts API.
