
# Gemma's Gulayan - Fresh Fruits & Vegetables

A farm-fresh produce e-commerce application built with Next.js, Firebase, and Genkit.

## 🛠 GitHub Sync & Security Troubleshooting (Fixing "Secret Scanning" or "Push Error")

Kung nakikita mo ang error na **"push declined"** o **"Google API Key alert"** sa GitHub, sundin ang mga ito sa iyong terminal:

### 1. Linisin ang iyong Git History (Napaka-importante para mawala ang Alert)
Dahil naba-block ang push o may alert dahil sa "secrets", kailangan nating "i-amend" ang iyong commit history:

```bash
# 1. I-save ang lahat ng changes
git add .
# 2. I-overwrite ang huling commit para mawala ang sensitive keys sa history
git commit --amend --no-edit
# 3. I-push ulit nang pilit (Force Push) para ma-overwrite ang history sa GitHub
git push origin main --force
```

### 2. Ayusin ang "Secret Scanning" (Payment Security)
Para gumana ang payment sa iyong live app, i-set up ang key sa Firebase Functions Secrets (hindi sa code):
```bash
firebase functions:secrets:set PAYMONGO_SECRET_KEY
```
*(I-paste ang iyong `sk_test_...` key kapag hiningi ng terminal)*

### 3. PWA Installation (Para magmukhang App sa Phone)
Kung hindi lumalabas ang "Install" button:
1. Siguraduhin na ang iyong site ay naka-**HTTPS**.
2. I-clear ang cache ng iyong mobile browser.
3. I-tap ang **"Add to Home Screen"** sa Safari (iOS) o Chrome (Android).

---

## 📱 How to Install on Your Mobile Phone (PWA)
1. Buksan ang app URL sa **Safari (iOS)** o **Chrome (Android)**.
2. I-tap ang **"Add to Home Screen"**.
3. Lalabas na ito bilang isang standalone app na may icon ni Gemma's Gulayan (walang browser bar).

---

## 💳 PayMongo Setup (Security)
Ang iyong Secret Key ay ligtas na nakatago sa Firebase Cloud. Upang gumana ang payments:
1. Siguraduhin na ang iyong repository ay **Private** sa GitHub settings para mas safe.
2. I-deploy ang functions gamit ang: `firebase deploy --only functions`.
