// Pickup Mtaani API Types

export interface PickupMtaaniLocation {
    id: number
    agent_id?: string
    name: string
    address?: string
    latitude?: number
    longitude?: number
    zone?: string
    area?: string
    description?: string
    google_maps_url?: string
    is_active?: boolean
    has_gps?: boolean
}

export interface PickupMtaaniArea {
    id: number
    name: string
    zone_id?: number
}

export interface PickupMtaaniZone {
    id: number
    name: string
}

export interface DeliveryChargeParams {
    origin_agent_id: number
    destination_agent_id: number
    origin_area?: string
    destination_area?: string
    package_size: 'small' | 'medium' | 'large'
}

export interface DeliveryChargeResponse {
    fee: number
    currency: string
    package_size: string
}

export interface PickupMtaaniConfig {
    apiKey: string
    baseUrl: string
    enabled: boolean
}
