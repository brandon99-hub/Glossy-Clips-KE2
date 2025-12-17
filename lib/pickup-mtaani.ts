// Pickup Mtaani API Client
import type {
    PickupMtaaniLocation,
    PickupMtaaniArea,
    PickupMtaaniZone,
    DeliveryChargeParams,
    DeliveryChargeResponse
} from './types/pickup-mtaani'

// Fallback locations for Nairobi
const FALLBACK_LOCATIONS: PickupMtaaniLocation[] = [
    { id: 1, name: "Westlands", area: "Westlands", zone: "Nairobi West", is_active: true },
    { id: 2, name: "CBD", area: "CBD", zone: "Nairobi Central", is_active: true },
    { id: 3, name: "Eastleigh", area: "Eastleigh", zone: "Nairobi East", is_active: true },
    { id: 4, name: "Karen", area: "Karen", zone: "Nairobi South", is_active: true },
    { id: 5, name: "Kasarani", area: "Kasarani", zone: "Nairobi North", is_active: true },
    { id: 6, name: "Ngong Road", area: "Ngong Road", zone: "Nairobi West", is_active: true },
    { id: 7, name: "Thika Road", area: "Thika Road", zone: "Nairobi North", is_active: true },
]

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
            if (!this.enabled) {
                console.log('[Pickup Mtaani] Using fallback locations (API disabled)')
                return FALLBACK_LOCATIONS
            }

            const data = await this.fetchAPI('/locations')
            return data.locations || data || []
        } catch (error) {
            console.error('[Pickup Mtaani] Failed to fetch locations:', error)
            console.log('[Pickup Mtaani] Falling back to hardcoded locations')
            return FALLBACK_LOCATIONS
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

    async calculateDeliveryCharge(params: DeliveryChargeParams): Promise<DeliveryChargeResponse> {
        try {
            if (!this.enabled) {
                // Fallback delivery charges
                const fallbackFees = {
                    small: 200,
                    medium: 350,
                    large: 500,
                }
                return {
                    fee: fallbackFees[params.package_size],
                    currency: 'KES',
                    package_size: params.package_size,
                }
            }

            const queryParams = new URLSearchParams({
                origin_agent_id: params.origin_agent_id.toString(),
                destination_agent_id: params.destination_agent_id.toString(),
                package_size: params.package_size,
            })

            const data = await this.fetchAPI(`/delivery-charge/agent-package?${queryParams}`)
            return {
                fee: data.fee || data.delivery_fee || 0,
                currency: data.currency || 'KES',
                package_size: params.package_size,
            }
        } catch (error) {
            console.error('[Pickup Mtaani] Failed to calculate delivery charge:', error)
            // Fallback to hardcoded rates
            const fallbackFees = {
                small: 200,
                medium: 350,
                large: 500,
            }
            return {
                fee: fallbackFees[params.package_size],
                currency: 'KES',
                package_size: params.package_size,
            }
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
