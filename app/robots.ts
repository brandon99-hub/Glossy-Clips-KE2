import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/', '/dashboard/'],
        },
        sitemap: `${process.env.NEXT_PUBLIC_APP_URL || 'https://glossy-clips-ke-2.vercel.app'}/sitemap.xml`,
    }
}
