
# 🥗 Gemma's Gulayan - Your Farm-Fresh Partner

**Gemma's Gulayan** is a modern e-commerce application designed to deliver the freshest vegetables and fruits directly from the farm to your doorstep. Built with Next.js, Firebase, and Genkit AI, it provides a fast, reliable, and premium shopping experience for fresh produce.

## ✨ Key Features

- **Farm-to-Door Delivery**: Fresh harvest sourced directly from local farmers, ensuring the highest quality and supporting local agriculture.
- **Real-time Inventory Control**: Our system tracks actual stock levels in the farm storage, so you only order what is currently available.
- **Secure Digital Payments**: Integrated with modern payment gateways to support safe transactions via GCash, Maya, and credit cards.
- **PWA (Progressive Web App)**: Installable on your mobile device for a native app-like experience—no browser bars, just your fresh market!
- **Customer Feedback System**: A transparent review system where customers can share their experiences and rate the harvest.
- **Priority Wishlist**: Save your must-have produce for quick access and re-ordering.
- **Email Notifications**: Get instant order confirmations and status updates directly in your Gmail.

## 🔒 Security Setup (EmailJS)

To fully secure your EmailJS keys and prevent GitHub from blocking your pushes, you should set up environment variables in your deployment platform (e.g., Firebase App Hosting):

1. Go to your project settings in your hosting dashboard.
2. Add the following environment variables:
   - `NEXT_PUBLIC_EMAILJS_SERVICE_ID`: your service_id
   - `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`: your template_id
   - `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`: your public_key
3. Re-deploy your application.

## 📱 Mobile Installation (PWA)

To enjoy the full experience of Gemma's Gulayan as a standalone app on your phone:

1. Open the app URL in **Safari (iOS)** or **Chrome (Android)**.
2. Tap the **Share** button (iOS) or the **Menu** (three dots on Android).
3. Select **"Add to Home Screen"**.
4. The Gemma's Gulayan icon will appear on your home screen, ready to use like any other app.

---

*Built with love for local farmers and the customers of Gemma's Gulayan.*
