import type { Product } from "@/lib/db"

export function generateProductSchema(product: Product, reviews?: any[]) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: product.images,
        sku: product.id.toString(),
        brand: {
            "@type": "Brand",
            name: "GlossyClipsKE",
        },
        offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "KES",
            availability:
                (product.stock_quantity || 0) > 0
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
            url: `${process.env.NEXT_PUBLIC_APP_URL}/product/${product.slug}`,
        },
    }

    // Add aggregate rating if reviews exist
    if (reviews && reviews.length > 0) {
        const avgRating =
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

        schema["aggregateRating"] = {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount: reviews.length,
            bestRating: 5,
            worstRating: 1,
        }
    }

    return schema
}

export function generateOrganizationSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "GlossyClipsKE",
        description: "Premium hair clips and lip gloss in Kenya",
        url: process.env.NEXT_PUBLIC_APP_URL,
        logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
        sameAs: [
            // Add social media links here
        ],
        contactPoint: {
            "@type": "ContactPoint",
            contactType: "Customer Service",
            availableLanguage: ["English"],
        },
    }
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    }
}
