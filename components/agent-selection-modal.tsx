"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
    Search,
    MapPin,
    Store,
    Check,
    Plus,
    Info,
    ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogClose
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerContent,
    DrawerTitle,
    DrawerDescription,
    DrawerClose
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"
import type { PickupMtaaniLocation } from "@/lib/db"

// Helper to strip JS fragments and boilerplate from agent descriptions
export function sanitizeDescription(text: string | null) {
    if (!text) return "Collection point."

    let cleaned = text;

    // 1. Nuke everything starting from known JS/JSON injection points
    const nukeTokens = ['self.__NEXT_F', '{"', '["', 'window.', '<script', '/*'];
    nukeTokens.forEach(token => {
        const index = cleaned.indexOf(token);
        if (index !== -1) {
            cleaned = cleaned.substring(0, index);
        }
    });

    // 2. Remove common boilerplate
    cleaned = cleaned
        .replace(/TERMS AND CONDITIONS.*/gi, '')
        .replace(/PRIVACY POLICY.*/gi, '')
        .replace(/PICKUP MTAANI @\d{4}.*/gi, '')
        .replace(/ALL RIGHTS RESERVED.*/gi, '');

    // 3. Clean up trailing remnants
    cleaned = cleaned.replace(/[\[\]{}()\\\/=,;:]+$/, '').trim();

    return cleaned || "Collection point."
}

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640)
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    return isMobile
}

export function AgentSelectionModal({
    locations,
    selectedLocation,
    onSelect,
    isOpen,
    onOpenChange
}: {
    locations: PickupMtaaniLocation[],
    selectedLocation: PickupMtaaniLocation | null,
    onSelect: (loc: PickupMtaaniLocation) => void,
    isOpen: boolean,
    onOpenChange: (open: boolean) => void
}) {
    const [searchQuery, setSearchQuery] = useState("")
    const isMobile = useIsMobile()

    const filteredLocations = useMemo(() => {
        return locations.filter(loc =>
            loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            loc.area.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [locations, searchQuery])

    // Group by area
    const locationsByArea = useMemo(() => {
        return filteredLocations.reduce((acc, loc) => {
            const area = loc.area || "Other"
            if (!acc[area]) acc[area] = []
            acc[area].push(loc)
            return acc
        }, {} as Record<string, PickupMtaaniLocation[]>)
    }, [filteredLocations])

    const Title = isMobile ? DrawerTitle : DialogTitle
    const Description = isMobile ? DrawerDescription : DialogDescription

    const content = (
        <>
            <div className="px-4 pt-1 pb-3 border-b bg-muted/20 sticky top-0 z-20 backdrop-blur-md">
                <div className="flex items-center justify-between mb-2">
                    <Title className="text-xs sm:text-base font-black flex items-center gap-2 uppercase tracking-tight">
                        <Store className="h-3.5 w-3.5 text-primary" />
                        Pickup Agent
                    </Title>
                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            <Info className="h-2.5 w-2.5" /> Official
                        </div>
                        {isMobile ? (
                            <DrawerClose asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full hover:bg-muted">
                                    <Plus className="h-3.5 w-3.5 rotate-45" />
                                </Button>
                            </DrawerClose>
                        ) : (
                            <DialogClose asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full hover:bg-muted">
                                    <Plus className="h-3.5 w-3.5 rotate-45" />
                                </Button>
                            </DialogClose>
                        )}
                    </div>
                </div>

                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search area or agent..."
                        className="pl-9 bg-background h-10 rounded-xl border-border focus:ring-primary/20 shadow-none text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="mt-1.5 flex items-center justify-between text-[9px] font-bold text-primary/60 uppercase tracking-widest px-1">
                    <span>{filteredLocations.length} Agents Available</span>
                    <span className="flex items-center gap-1 opacity-50"><Info className="h-2.5 w-2.5" /> Updated Daily</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-[40vh]">
                {Object.keys(locationsByArea).length > 0 ? (
                    Object.entries(locationsByArea).sort().map(([area, areaLocs]) => (
                        <div key={area} className="space-y-3">
                            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] py-2">{area}</h3>
                            <div className="grid gap-2.5">
                                {areaLocs.map((loc) => (
                                    <button
                                        key={loc.id}
                                        onClick={() => onSelect(loc)}
                                        className={cn(
                                            "text-left p-3.5 rounded-2xl border-2 transition-all group",
                                            selectedLocation?.id === loc.id
                                                ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                                                : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
                                        )}
                                    >
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className="font-bold text-sm truncate group-hover:text-primary transition-colors">{loc.name}</span>
                                                    {selectedLocation?.id === loc.id && <Check className="h-4 w-4 text-primary shrink-0" />}
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-2 italic leading-relaxed mb-2.5">
                                                    {sanitizeDescription(loc.description)}
                                                </p>

                                                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                                    <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-tighter">Est. Fee</div>
                                                    <div className="bg-primary/10 text-primary text-[10px] font-black px-2 py-1 rounded-lg border border-primary/20 shadow-sm">
                                                        KES {loc.delivery_fee_min || 180}-{loc.delivery_fee_max || 250}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-3.5 pt-3 border-t border-dashed flex items-center justify-between">
                                            <div className="flex flex-wrap gap-1.5 items-center">
                                                {loc.latitude && loc.longitude ? (
                                                    <a
                                                        href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="inline-flex items-center gap-1 text-[9px] bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full border border-sky-100 font-bold tracking-tight hover:bg-sky-100 transition-colors shadow-sm"
                                                    >
                                                        <MapPin className="h-2.5 w-2.5" /> EXACT GPS
                                                    </a>
                                                ) : loc.has_gps && loc.google_maps_url ? (
                                                    <a
                                                        href={loc.google_maps_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="inline-flex items-center gap-1 text-[9px] bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full border border-sky-100 font-bold tracking-tight hover:bg-sky-100 transition-colors shadow-sm"
                                                    >
                                                        <MapPin className="h-2.5 w-2.5" /> OPEN MAPS
                                                    </a>
                                                ) : loc.has_gps ? (
                                                    <span className="inline-flex items-center gap-1 text-[9px] bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full border border-sky-100 font-bold tracking-tight shadow-sm">
                                                        <MapPin className="h-2.5 w-2.5" /> GPS READY
                                                    </span>
                                                ) : null}
                                            </div>
                                            <div className="text-[9px] font-bold text-primary group-hover:translate-x-1 transition-transform">SELECT AGENT →</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-16 text-center space-y-4">
                        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto text-muted-foreground/30">
                            <Search className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="font-bold text-muted-foreground">No matching agents</p>
                            <p className="text-xs text-muted-foreground/60">Try searching for a different area</p>
                        </div>
                    </div>
                )}
            </div>

        </>
    )

    if (isMobile) {
        return (
            <Drawer open={isOpen} onOpenChange={onOpenChange}>
                <DrawerContent className="h-[96vh] flex flex-col rounded-t-[2.5rem] border-t-0 shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
                    <div className="mx-auto w-12 h-1 bg-muted-foreground/20 rounded-full mt-3 mb-1 shrink-0" />
                    {content}
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden flex flex-col h-[85vh] sm:h-[80vh] rounded-3xl border-none shadow-2xl">
                {content}
                <div className="p-4 border-t bg-muted/5">
                    <DialogClose asChild>
                        <Button variant="outline" className="w-full h-11 rounded-xl font-bold hover:bg-muted/50 transition-colors">Close Selection</Button>
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    )
}
