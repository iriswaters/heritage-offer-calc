# Heritage Offer Calculator

Mobile calculator for Home Buying Specialists to use during seller appointments.

---

## Deploy to Vercel (easiest path)

You don't need to install anything on your computer for this route.

### 1. Create a Vercel account
Go to **https://vercel.com** → click **Sign Up** → choose **Continue with GitHub**
(create a free GitHub account first if you don't have one — takes 30 seconds).

### 2. Create a GitHub repository
- Go to **https://github.com/new**
- Repository name: `heritage-offer-calculator`
- Keep it **Private** if you want
- Click **Create repository**

### 3. Upload these files to GitHub
On the new empty repo page, click **"uploading an existing file"**.

Drag the **entire contents** of this project folder (not the folder itself — open it and drag everything inside) into the upload box. This includes:
- `package.json`
- `vite.config.js`
- `tailwind.config.js`
- `postcss.config.js`
- `index.html`
- `.gitignore`
- The `src/` folder
- The `public/` folder

Click **Commit changes** at the bottom.

### 4. Deploy on Vercel
- Back on Vercel, click **Add New → Project**
- Find your `heritage-offer-calculator` repo and click **Import**
- Leave all settings as default (Vercel auto-detects Vite)
- Click **Deploy**

In about 60 seconds you'll get a URL like:
`https://heritage-offer-calculator.vercel.app`

That's your live app. Share it with every HBS.

---

## Add to iPhone home screen

1. Open the Vercel URL in **Safari** (must be Safari, not Chrome)
2. Tap the **share button** (square with arrow up) at the bottom
3. Scroll down and tap **Add to Home Screen**
4. Tap **Add** in the top right

The app installs with the navy home-icon. Tapping it opens full-screen with no browser bar — behaves like a native app.

## Add to Android home screen

1. Open the Vercel URL in **Chrome**
2. Tap the three-dot menu in the top right
3. Tap **Install app** (or **Add to Home screen**)
4. Tap **Install**

---

## Changing the formulas later

Edit `src/App.jsx`. Look for the `calc` section near the top:

```js
// Cash offer (flip): lesser of two formulas, based on ARV
const cashA = arv * 0.895 - 40000 - repairTotal;
const cashB = arv * 0.7 - repairTotal;
const maxCash = Math.min(cashA, cashB);
// Novation: based on As-Is price
const maxNov = asIs * 0.925 - 30000;
const defaultAnchor = maxCash - 10000;
```

Change any number there. Push the update to GitHub (edit the file directly in the browser and click Commit) — Vercel auto-redeploys in 30 seconds, and every HBS's installed app gets the new version on next open.

Repair rates:
```js
const repairRates = { light: 12, medium: 20, heavy: 30 };
```

---

## Running locally (optional, for developers)

```
npm install
npm run dev
```

Opens at `http://localhost:5173`.
