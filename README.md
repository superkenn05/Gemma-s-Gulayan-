
# 🥗 Gemma's Gulayan - Ang Inyong Farm-Fresh Partner

Ang **Gemma's Gulayan** ay isang modernong e-commerce application na idinisenyo para ihatid ang pinakasariwang gulay at prutas mula sa bukid diretso sa inyong hapag-kainan. Binuo gamit ang Next.js, Firebase, at Genkit AI para sa isang mabilis at maasahang shopping experience.

## ✨ Pangunahing Features

- **Farm-to-Door Delivery**: Sariwang ani mula sa mga lokal na magsasaka.
- **Real-time Inventory Control**: Siguradong "In Stock" ang bawat order.
- **Secure Digital Payments**: Pinapatakbo ng **PayMongo** para sa ligtas na GCash, Maya, at Card transactions.
- **PWA (Progressive Web App)**: Maaaring i-install sa iyong mobile phone na parang tunay na app—walang browser bars!
- **Customer Feedback System**: Makabasa at makapag-iwan ng reviews para sa bawat harvest.
- **Priority Wishlist**: I-save ang mga paborito mong gulay para sa mabilisang pag-order sa susunod.

## 📱 Paano i-install sa Mobile (PWA)

1. Buksan ang URL ng app sa **Safari (iOS)** o **Chrome (Android)**.
2. I-tap ang **Share** button (iOS) o ang **Menu** (tatlong tuldok sa Android).
3. Piliin ang **"Add to Home Screen"**.
4. Lalabas na ang icon ni Gemma's Gulayan sa iyong home screen at handa na itong gamitin bilang standalone app.

## 🛠️ GitHub Sync & Security (Troubleshooting)

Kung ikaw ay nakakaranas ng **"push declined"** o **"Google API Key alert"** sa GitHub, sundin ang mga sumusunod na hakbang sa iyong terminal:

### 1. Paglilinis ng Git History (Para mawala ang Alerts)
```bash
git add .
git commit --amend --no-edit
git push origin main --force
```

### 2. PayMongo Setup
Upang gumana ang payments nang ligtas, huwag ilagay ang key sa code. I-set up ito sa Firebase Secrets:
```bash
firebase functions:secrets:set PAYMONGO_SECRET_KEY
```
*(I-paste ang iyong `sk_test_...` key kapag hiningi ng terminal at i-deploy gamit ang `firebase deploy --only functions`)*

---

*Binuo nang may pagmamahal para sa mga lokal na magsasaka at mamimili ng Gemma's Gulayan.*
