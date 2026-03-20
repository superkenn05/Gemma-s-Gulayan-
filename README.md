
# Gemma's Gulayan - Fresh Fruits & Vegetables

A farm-fresh produce e-commerce application built with Next.js, Firebase, and Genkit.

## 🛠 GitHub Sync Troubleshooting (Kapag ayaw mag-Sync o may Push Error)

Kung nakikita mo ang error na **"push declined"** o **"repository rule violations"**, ito ay dahil may "Secret Key" na nakita sa iyong history. Sundin ang mga ito sa iyong terminal:

### 1. Linisin ang iyong Git History (Napaka-importante)
Dahil naba-block ang push dahil sa "secrets", kailangan nating "i-amend" ang iyong huling commit para mawala ang key:
```bash
# 1. Siguraduhin na nai-save mo na ang mga bagong changes
git add .
# 2. I-overwrite ang huling commit para maging malinis (walang keys)
git commit --amend --no-edit
# 3. I-push ulit nang pilit (Force Push)
git push origin main --force
```

### 2. Ayusin ang "Diverged History" (Kung kailangan mag-Pull)
```bash
git pull origin main --rebase
```

### 3. Ayusin ang "Secret Scanning" (Payment Security)
Para gumana ang payment sa iyong live app, i-set up ang key sa Firebase Functions Secrets (hindi sa code):
```bash
firebase functions:secrets:set PAYMONGO_SECRET_KEY
```
*(I-paste ang iyong `sk_test_...` key kapag hiningi ng terminal)*

---

## 📱 How to Install on Your Mobile Phone (PWA)
1. Buksan ang app URL sa **Safari (iOS)** o **Chrome (Android)**.
2. I-tap ang **"Add to Home Screen"**.
3. Lalabas na ito bilang isang standalone app na may icon ni Gemma's Gulayan (walang browser bar).

---

## 💳 PayMongo Setup (Security)
Ang iyong Secret Key ay ligtas na nakatago. Upang gumana ang payments:
1. Siguraduhin na ang iyong repository ay **Private** sa GitHub settings.
2. I-deploy ang functions gamit ang: `firebase deploy --only functions`.
