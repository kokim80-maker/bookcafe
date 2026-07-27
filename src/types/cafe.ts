export type GeocodeStatus = 'success' | 'failed'

export interface Cafe {
  id: string
  name: string
  address: string
  category: string
  lat: number | null
  lng: number | null
  geocodeStatus: GeocodeStatus
}
