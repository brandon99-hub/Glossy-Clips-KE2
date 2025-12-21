"use client"

import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWishlist } from "@/lib/wishlist-context"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface WishlistButtonProps {
    productId: number
    variant?: "default" | "icon"
    className?: string
}

export function WishlistButton({
    productId,
    variant = "default",
    className,
}: WishlistButtonProps) {
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
    const inWishlist = isInWishlist(productId)

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault() // Prevent navigation if inside a link
        e.stopPropagation()

        if (inWishlist) {
            removeFromWishlist(productId)
            toast.success("Removed from wishlist", {
                description: "Product removed from your saved items",
            })
        } else {
            addToWishlist(productId)
            toast.success("Added to wishlist! 💕", {
                description: "View your saved items in your dashboard",
                action: {
                    label: "View Wishlist",
                    onClick: () => window.location.href = "/dashboard?tab=wishlist",
                },
            })
        }
    }

    if (variant === "icon") {
        return (
            <button
                onClick={handleClick}
                className={cn(
                    "p-2 rounded-full bg-white/90 backdrop-blur-sm transition-all hover:scale-110 shadow-sm",
                    inWishlist
                        ? "text-rose-500 hover:text-rose-600"
                        : "text-muted-foreground hover:text-foreground",
                    className
                )}
                aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
                <Heart
                    className={cn("h-5 w-5", inWishlist && "fill-current")}
                />
            </button>
        )
    }

    return (
        <Button
            variant={inWishlist ? "default" : "outline"}
            size="sm"
            onClick={handleClick}
            className={cn(
                "gap-2",
                inWishlist && "bg-rose-500 hover:bg-rose-600",
                className
            )}
        >
            <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
            {inWishlist ? "Saved" : "Save"}
        </Button>
    )
}
