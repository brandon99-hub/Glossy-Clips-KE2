"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { Search, MapPin, Loader2, Navigation, Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useDebounce } from "use-debounce"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"

interface LocationResult {
    display_name: string
    lat: string
    lon: string
    address?: {
        suburb?: string
        neighbourhood?: string
        city?: string
        road?: string
    }
}

interface LocationPickerProps {
    onLocationSelect: (data: {
        locationName: string
        lat: number
        lng: number
        estate?: string
    }) => void
    initialLocation?: { lat: number; lng: number }
}

// Internal component to handle map animation
function MapController({ center }: { center: [number, number] }) {
    const map = useMap()
    useEffect(() => {
        if (center) {
            map.flyTo(center, 16, { duration: 1.5 })
        }
    }, [center, map])
    return null
}

// Internal component to handle map click events
function MapEvents({ onClick }: { onClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onClick(e.latlng.lat, e.latlng.lng)
        },
    })
    return null
}

export function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedQuery] = useDebounce(searchQuery, 800)
    const [results, setResults] = useState<LocationResult[]>([])
    const [searching, setSearching] = useState(false)
    const [hasBeenSearched, setHasBeenSearched] = useState(false)
    const [isSelected, setIsSelected] = useState(false)
    const [selectedPos, setSelectedPos] = useState<[number, number]>(
        initialLocation ? [initialLocation.lat, initialLocation.lng] : [-1.286389, 36.817223] // Default to Nairobi
    )
    const [customIcon, setCustomIcon] = useState<any>(null)

    // Fix for Leaflet marker icons in Next.js
    useEffect(() => {
        const L = require("leaflet")
        const icon = L.divIcon({
            html: `<div class="bg-rose-500 p-2 rounded-full shadow-lg border-2 border-white transform -translate-y-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                   </div>`,
            className: "custom-div-icon",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
        })
        setCustomIcon(icon)
    }, [])

    const searchLocations = useCallback(async (query: string) => {
        if (!query || query.length < 3) {
            setResults([])
            setSearching(false)
            setHasBeenSearched(false)
            return
        }
        setSearching(true)
        setHasBeenSearched(true)
        try {
            // Nominatim API call (restricted to Kenya)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ke&addressdetails=1&limit=5`
            )
            const data = await response.json()
            setResults(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error("Search error:", error)
            toast.error("Failed to fetch address suggestions")
            setResults([])
        } finally {
            setSearching(false)
        }
    }, [])

    useEffect(() => {
        if (isSelected) {
            setIsSelected(false)
            return
        }

        if (debouncedQuery) {
            searchLocations(debouncedQuery)
        } else {
            setResults([])
            setHasBeenSearched(false)
        }
    }, [debouncedQuery, searchLocations])

    const handleSelectResult = (result: LocationResult) => {
        const lat = parseFloat(result.lat)
        const lng = parseFloat(result.lon)
        setSelectedPos([lat, lng])
        setResults([])
        setHasBeenSearched(false)
        setIsSelected(true)
        setSearchQuery(result.display_name)

        onLocationSelect({
            locationName: result.display_name,
            lat,
            lng,
            estate: result.address?.suburb || result.address?.neighbourhood || result.address?.road
        })
    }

    const handleMapClick = async (lat: number, lng: number) => {
        setSelectedPos([lat, lng])
        setResults([])
        setHasBeenSearched(false)
        // Reverse Geocode
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
            )
            const data = await response.json()
            if (data) {
                setIsSelected(true)
                setSearchQuery(data.display_name)
                onLocationSelect({
                    locationName: data.display_name,
                    lat,
                    lng,
                    estate: data.address?.suburb || data.address?.neighbourhood || data.address?.road
                })
            }
        } catch (error) {
            console.error("Reverse geocode error:", error)
        }
    }

    return (
        <div className="space-y-4">
            <div className="relative z-30">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-rose-500" />
                    <Input
                        placeholder="Search for your estate or area (e.g. Kileleshwa)"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setIsSelected(false)
                        }}
                        className="pl-10 pr-10 h-12 rounded-xl bg-white/60 border-white/60 focus:ring-rose-500 shadow-sm transition-all focus:bg-white"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {searching && (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        )}
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery("")
                                    setResults([])
                                    setHasBeenSearched(false)
                                }}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="h-4 w-4 text-muted-foreground" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Search Results Dropdown */}
                <AnimatePresence>
                    {(searching || (hasBeenSearched && (results.length > 0 || !searching))) && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto z-50 divide-y divide-gray-100"
                        >
                            {searching ? (
                                <div className="p-8 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                                    <p className="text-xs text-muted-foreground font-medium">Searching for locations...</p>
                                </div>
                            ) : results.length > 0 ? (
                                results.map((result, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelectResult(result)}
                                        className="w-full px-4 py-3 text-left hover:bg-rose-50 transition-colors flex items-start gap-3 group"
                                    >
                                        <MapPin className="h-4 w-4 text-muted-foreground group-hover:text-rose-500 mt-1 shrink-0" />
                                        <div>
                                            <p className="text-sm font-bold text-gray-800 line-clamp-1">
                                                {result.display_name}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                                                {result.address?.suburb || result.address?.city || "Kenya"}
                                            </p>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="p-8 text-center pb-10">
                                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Search className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-800">No results found</p>
                                    <p className="text-[10px] text-muted-foreground mt-1 max-w-[200px] mx-auto leading-relaxed">
                                        We couldn't find "<span className="font-bold text-rose-500">{searchQuery}</span>".
                                        Try a more general area or check for typos.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* The Map */}
            <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden border-2 border-white/60 shadow-xl relative z-10">
                <MapContainer
                    center={selectedPos}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                    className="z-0"
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <MapController center={selectedPos} />
                    <MapEvents onClick={handleMapClick} />
                    {customIcon && <Marker position={selectedPos} icon={customIcon} />}
                </MapContainer>

                {/* Visual Hint */}
                <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-md text-[10px] text-white px-3 py-1.5 rounded-full font-bold uppercase tracking-widest flex items-center gap-2">
                        <Navigation className="w-3 h-3" />
                        Tap map to adjust pin
                    </div>
                </div>
            </div>
        </div>
    )
}
