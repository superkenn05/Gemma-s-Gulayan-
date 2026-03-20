import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';
import { CartProvider } from '@/providers/cart-provider';
import { AuthGuard } from '@/components/auth-guard';

export const metadata: Metadata = {
  title: "Gemma's Gulayan",
  description: 'Online vegetable and fruit store delivering farm-fresh produce to your doorstep.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: "Gemma's",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#1b8a2e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="https://res.cloudinary.com/dzytzdamb/image/upload/v1773855923/ff300e344_1000010341_o2ss83.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-body antialiased bg-background overflow-x-hidden">
        <FirebaseClientProvider>
          <AuthGuard>
            <CartProvider>
              {children}
              <Toaster />
            </CartProvider>
          </AuthGuard>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
