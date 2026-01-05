// Pickup Mtaani API Client
import type {
    PickupMtaaniLocation,
    PickupMtaaniArea,
    PickupMtaaniZone,
    DeliveryChargeParams,
    DeliveryChargeResponse
} from './types/pickup-mtaani'

// Fallback locations for Nairobi - DEPRECATED: Using database instead
const FALLBACK_LOCATIONS: PickupMtaaniLocation[] = []

class PickupMtaaniClient {
    private apiKey: string
    private baseUrl: string
    private enabled: boolean

    constructor() {
        this.apiKey = process.env.PICKUP_MTAANI_API_KEY || ''
        this.baseUrl = process.env.PICKUP_MTAANI_BASE_URL || 'https://api.pickupmtaani.com/api/v1'
        this.enabled = process.env.PICKUP_MTAANI_ENABLED === 'true'
    }

    private async fetchAPI(endpoint: string, options: RequestInit = {}) {
        if (!this.enabled || !this.apiKey) {
            throw new Error('Pickup Mtaani API not configured')
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        })

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`)
        }

        return response.json()
    }

    async getLocations(): Promise<PickupMtaaniLocation[]> {
        try {
            if (!this.enabled || !this.apiKey) {
                // If API is disabled, return empty array. 
                // The API route handler will fetch from the local database cache.
                return []
            }

            const data = await this.fetchAPI('/locations')
            return data.locations || data || []
        } catch (error) {
            console.error('[Pickup Mtaani] Failed to fetch locations:', error)
            return []
        }
    }

    async getAreas(): Promise<PickupMtaaniArea[]> {
        try {
            if (!this.enabled) {
                return []
            }

            const data = await this.fetchAPI('/locations/areas')
            return data.areas || data || []
        } catch (error) {
            console.error('[Pickup Mtaani] Failed to fetch areas:', error)
            return []
        }
    }

    async getZones(): Promise<PickupMtaaniZone[]> {
        try {
            if (!this.enabled) {
                return []
            }

            const data = await this.fetchAPI('/locations/zones')
            return data.zones || data || []
        } catch (error) {
            console.error('[Pickup Mtaani] Failed to fetch zones:', error)
            return []
        }
    }

    async calculateDeliveryCharge(params: DeliveryChargeParams): Promise<any> {
        try {
            // Favor local calculation based on verified metrics
            const range = this.calculateLocalFee(
                params.origin_area || 'TMALL(LANGATA RD)', // Default to Joggers Hub
                params.destination_area || 'Unknown',
                params.package_size
            )

            return {
                fee: range.min, // Keep for backward compatibility
                fee_min: range.min,
                fee_max: range.max,
                currency: 'KES',
                package_size: params.package_size,
            }
        } catch (error) {
            console.error('[Pickup Mtaani] Failed to calculate delivery charge:', error)
            // Final fallback to generic rates
            return {
                fee: 180,
                fee_min: 180,
                fee_max: 300,
                currency: 'KES',
                package_size: params.package_size,
            }
        }
    }

    /**
     * Calculates fee based on distance/zone from Joggers Hub (TMALL)
     * Returns a range { min, max } to reflect estimation uncertainty
     */
    calculateLocalFee(originArea: string, destinationArea: string, size: 'small' | 'medium' | 'large'): { min: number, max: number } {
        const dest = destinationArea.toLowerCase()
        const orig = originArea.toLowerCase()

        // Size multiplier (1x for small, 1.5x for medium, 2x for large)
        const sizeMultiplier = size === 'small' ? 1 : size === 'medium' ? 1.5 : 2

        let baseMin = 180
        let baseMax = 250

        // 1. Countrywide Check (Simple keyword matching for major towns outside Nairobi)
        if ([
            'mombasa', 'kisumu', 'nakuru', 'eldoret', 'kisii', 'kakamega',
            'malindi', 'diani', 'kilifi', 'lamu', 'watamu', 'nanyuki', 'meru',
            'nyeri', 'embu', 'kericho', 'bomet', 'kitale'
        ].some(town => dest.includes(town))) {
            baseMin = 290
            baseMax = 450
        }
        // 2. CBD / Hub Routes (Nairobi Only)
        else if (dest.includes('cbd') || dest.includes('central') || dest.includes('hub')) {
            baseMin = 100
            baseMax = 150
        }
        // 3. Intra-Area (Same neighborhood)
        else if (orig === dest) {
            baseMin = 120
            baseMax = 150
        }
        // 4. Mashinani / Outer Metro (Areas often prefixed with "Mashinani" or further out)
        else if (dest.includes('mashinani') || dest.includes('outer') || dest.includes('thika') || dest.includes('kitengela') || dest.includes('athi river')) {
            baseMin = 250
            baseMax = 300
        }
        // 5. Default Nairobi Mtaani-to-Mtaani
        else {
            baseMin = 180
            baseMax = 250
        }

        return {
            min: Math.ceil(baseMin * sizeMultiplier),
            max: Math.ceil(baseMax * sizeMultiplier)
        }
    }

    // Helper function to estimate package size based on cart
    estimatePackageSize(cartTotal: number, itemCount: number): 'small' | 'medium' | 'large' {
        if (itemCount <= 3 && cartTotal < 2000) return 'small'
        if (itemCount <= 6 && cartTotal < 5000) return 'medium'
        return 'large'
    }

    isEnabled(): boolean {
        return this.enabled && !!this.apiKey
    }
}

// Export singleton instance
export const pickupMtaaniClient = new PickupMtaaniClient()
