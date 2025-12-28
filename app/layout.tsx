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
