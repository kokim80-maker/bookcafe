import { useEffect, useRef, useState, type RefObject } from 'react'
import { loadKakaoMapSdk, SEOUL_CITY_HALL_CENTER } from '@/lib/kakaoMap'
import type { Cafe } from '@/types/cafe'

interface MapViewProps {
  cafes: Cafe[]
  onMarkerClick: (cafe: Cafe) => void
  focusTarget?: { lat: number; lng: number } | null
}

export function MapView({ cafes, onMarkerClick, focusTarget }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [isMapReady, setIsMapReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    loadKakaoMapSdk().then(() => {
      if (cancelled || !mapContainerRef.current || mapRef.current) return
      mapRef.current = initKakaoMap(mapContainerRef.current, SEOUL_CITY_HALL_CENTER)
      setIsMapReady(true)
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!isMapReady) return
    renderCafeMarkers(mapRef.current, cafes, markersRef, onMarkerClick)
  }, [isMapReady, cafes, onMarkerClick])

  useEffect(() => {
    if (!isMapReady || !focusTarget) return
    mapRef.current.panTo(new window.kakao.maps.LatLng(focusTarget.lat, focusTarget.lng))
  }, [isMapReady, focusTarget])

  return (
    <div
      ref={mapContainerRef}
      className="h-[420px] w-full rounded-lg border border-border bg-muted"
    />
  )
}

function initKakaoMap(container: HTMLDivElement, center: { lat: number; lng: number }) {
  return new window.kakao.maps.Map(container, {
    center: new window.kakao.maps.LatLng(center.lat, center.lng),
    level: 4,
  })
}

function clearCafeMarkers(markersRef: RefObject<any[]>) {
  markersRef.current.forEach((marker) => marker.setMap(null))
  markersRef.current = []
}

function renderCafeMarkers(
  map: any,
  cafes: Cafe[],
  markersRef: RefObject<any[]>,
  onMarkerClick: (cafe: Cafe) => void,
) {
  clearCafeMarkers(markersRef)

  cafes
    .filter((cafe) => cafe.geocodeStatus === 'success' && cafe.lat !== null && cafe.lng !== null)
    .forEach((cafe) => {
      const marker = new window.kakao.maps.Marker({
        map,
        position: new window.kakao.maps.LatLng(cafe.lat as number, cafe.lng as number),
        title: cafe.name,
      })

      window.kakao.maps.event.addListener(marker, 'click', () => {
        onMarkerClick(cafe)
      })

      markersRef.current.push(marker)
    })
}
