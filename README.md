
# 🥗 Gemma's Gulayan - Your Farm-Fresh Partner

**Gemma's Gulayan** is a modern e-commerce application designed to deliver the freshest vegetables and fruits directly from the farm to your doorstep. Built with Next.js, Firebase, and Genkit AI for a fast and reliable shopping experience.

## ✨ Key Features

- **Farm-to-Door Delivery**: Fresh harvest sourced directly from local farmers.
- **Real-time Inventory Control**: Ensuring every order is backed by actual stock levels.
- **Secure Digital Payments**: Powered by **PayMongo** for safe GCash, Maya, and Card transactions.
- **PWA (Progressive Web App)**: Installable on your mobile device for a native app-like experience—no browser bars!
- **Customer Feedback System**: Read and leave reviews for every harvest.
- **Priority Wishlist**: Save your favorite produce for quick re-ordering.

## 📱 Mobile Installation (PWA)

1. Open the app URL in **Safari (iOS)** or **Chrome (Android)**.
2. Tap the **Share** button (iOS) or the **Menu** (three dots on Android).
3. Select **"Add to Home Screen"**.
4. The Gemma's Gulayan icon will appear on your home screen, ready to use as a standalone app.

## 🛠️ GitHub Sync & Security (Troubleshooting)

If you encounter a **"push declined"** or **"Google API Key alert"** on GitHub, follow these steps in your terminal to clear sensitive history and sync correctly:

### 1. Cleaning Git History (To resolve alerts)
```bash
git add .
git commit --amend --no-edit
git push origin main --force
```

### 2. PayMongo Setup
To ensure secure payment processing, do not hardcode keys. Set them up in Firebase Secrets:
```bash
firebase functions:secrets:set PAYMONGO_SECRET_KEY
```
*(Paste your `sk_test_...` key when prompted and deploy using `firebase deploy --only functions`)*

---

*Built with love for local farmers and the customers of Gemma's Gulayan.*
