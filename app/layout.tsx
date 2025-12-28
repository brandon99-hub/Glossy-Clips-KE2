import type React from "react"
import type { Metadata, Viewport } from "next"
import { Poppins, Dancing_Script } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster } from "sonner"
import { CartProvider } from "@/lib/cart-context"
import { WishlistProvider } from "@/lib/wishlist-context"
import { AuthProvider } from "@/components/auth-provider"
import { Header } from "@/components/header"
import { MobileNav } from "@/components/mobile-nav"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { Footer } from "@/components/footer"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
})

const dancing = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-dancing",
})

export const metadata: Metadata = {
  title: "GLOSSYCLIPSKE | Hair Clips & Lip Gloss",
  description:
    "Premium hair clips and lip gloss for the glow-up generation. Shop now and get a free gift card with every order! Based in Kenya 🇰🇪",
  generator: 'v0.app',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/logo.jpeg',
  },
  openGraph: {
    title: 'GLOSSYCLIPSKE | Hair Clips & Lip Gloss',
    description: 'Premium hair clips and lip gloss for the glow-up generation',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'GlossyClipsKE',
    locale: 'en_KE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GLOSSYCLIPSKE | Hair Clips & Lip Gloss',
    description: 'Premium hair clips and lip gloss for the glow-up generation',
  },
}

export const viewport: Viewport = {
  themeColor: "#f43f5e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${dancing.variable} font-sans antialiased`}>
        {/* Inline loading screen - shows immediately while React loads */}
        <div id="app-loading" style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom right, #fff1f2, #ffffff, #fffbeb)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <img
              src="/logo.jpeg"
              alt="GlossyClipsKE"
              style={{
                width: '120px',
                height: '120px',
                margin: '0 auto 1.5rem',
                borderRadius: '50%',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              }}
            />
            <h1 style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              background: 'linear-gradient(to right, #f43f5e, #ec4899, #f59e0b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              GLOSSYCLIPSKE
            </h1>
          </div>
        </div>

        <script dangerouslySetInnerHTML={{
          __html: `
            // Hide loading screen once React hydrates
            window.addEventListener('load', function() {
              const loader = document.getElementById('app-loading');
              if (loader) {
                setTimeout(function() {
                  loader.style.opacity = '0';
                  loader.style.transition = 'opacity 0.3s';
                  setTimeout(function() {
                    loader.style.display = 'none';
                  }, 300);
                }, 100);
              }
            });
          `
        }} />

        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Header />
              <main className="min-h-screen pb-20 md:pb-0">{children}</main>
              <Footer />
              <MobileNav />
              <WhatsAppButton />
              <PWAInstallPrompt />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#ffe4e6', // rose-100 - lighter pink
              border: '1px solid #fda4af', // rose-300
              color: '#881337', // rose-950
            },
            classNames: {
              actionButton: "bg-black text-white hover:bg-gray-800",
              cancelButton: "bg-rose-100 text-rose-900",
            },
          }}
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
