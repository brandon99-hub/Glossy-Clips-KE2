"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Instagram, Phone } from "lucide-react"

export function Footer() {
    const pathname = usePathname()

    // Don't show footer on admin pages
    if (pathname?.startsWith("/admin")) {
        return null
    }

    return (
        <footer className="bg-muted/30 border-t border-border mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <Image src="/logo.jpeg" alt="GLOSSYCLIPSKE" width={40} height={40} className="rounded-full" />
                            <span className="font-bold text-lg tracking-tight">GLOSSYCLIPSKE</span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Premium hair clips and lip gloss for the glow-up generation. Based in Kenya 🇰🇪
                        </p>
                    </div>

                    {/* Shop and Stay Connected side-by-side on mobile */}
                    <div className="grid grid-cols-2 gap-8 md:col-span-2 md:grid-cols-2">
                        <div>
                            <h3 className="font-semibold mb-4">Shop</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <Link href="/shop" className="hover:text-primary transition-colors">All Products</Link>
                                </li>
                                <li>
                                    <Link href="/shop?category=hair-clip" className="hover:text-primary transition-colors">Hair Clips</Link>
                                </li>
                                <li>
                                    <Link href="/shop?category=gloss" className="hover:text-primary transition-colors">Lip Gloss</Link>
                                </li>
                                <li>
                                    <Link href="/bundles" className="hover:text-primary transition-colors">Bundles</Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Stay Connected</h3>
                            <div className="flex gap-4 mb-4">
                                <a
                                    href="https://instagram.com/_glossyclipke_"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center hover:bg-rose-200 transition-colors"
                                >
                                    <Instagram className="h-5 w-5" />
                                </a>
                                <a
                                    href="https://wa.me/254741991213"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors"
                                >
                                    <Phone className="h-5 w-5" />
                                </a>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Follow us for new drops and styling tips!
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} GLOSSYCLIPSKE. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
