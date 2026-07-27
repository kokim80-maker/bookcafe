import { loadKakaoMapSdk } from '@/lib/kakaoMap'
import type { CafeExcelRow } from '@/lib/excel'
import type { Cafe } from '@/types/cafe'

interface GeocodeResult {
  lat: number
  lng: number
}

export function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  return new Promise((resolve) => {
    const geocoder = new window.kakao.maps.services.Geocoder()
    geocoder.addressSearch(address, (result: any[], status: string) => {
      if (status === window.kakao.maps.services.Status.OK && result[0]) {
        resolve({ lat: Number(result[0].y), lng: Number(result[0].x) })
      } else {
        resolve(null)
      }
    })
  })
}

export async function buildCafesFromExcelRows(
  rows: CafeExcelRow[],
  onProgress?: (done: number, total: number) => void,
): Promise<Cafe[]> {
  await loadKakaoMapSdk()

  const cafes: Cafe[] = []

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index]
    const geocoded = await geocodeAddress(row.address)

    cafes.push({
      id: `cafe-${index}`,
      name: row.name,
      address: row.address,
      category: row.category,
      lat: geocoded?.lat ?? null,
      lng: geocoded?.lng ?? null,
      geocodeStatus: geocoded ? 'success' : 'failed',
    })

    onProgress?.(index + 1, rows.length)
  }

  return cafes
}
