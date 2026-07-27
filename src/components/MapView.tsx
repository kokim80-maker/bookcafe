import { useEffect, useRef, useState, type RefObject } from 'react'
import { loadKakaoMapSdk, SEOUL_CITY_HALL_CENTER } from '@/lib/kakaoMap'
import { buildVisitKey } from '@/lib/visitNotes'
import type { Cafe } from '@/types/cafe'

const VISITED_MARKER_IMAGE_SRC =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">' +
      '<path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 24 16 24s16-13 16-24C32 7.163 24.837 0 16 0z" fill="#16a34a"/>' +
      '<circle cx="16" cy="16" r="6" fill="#ffffff"/>' +
      '</svg>',
  )

interface MapViewProps {
  cafes: Cafe[]
  onMarkerClick: (cafe: Cafe) => void
  focusTarget?: { lat: number; lng: number } | null
  visitedKeys?: Set<string>
}

export function MapView({ cafes, onMarkerClick, focusTarget, visitedKeys }: MapViewProps) {
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
    renderCafeMarkers(mapRef.current, cafes, markersRef, onMarkerClick, visitedKeys ?? new Set())
  }, [isMapReady, cafes, onMarkerClick, visitedKeys])

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
  visitedKeys: Set<string>,
) {
  clearCafeMarkers(markersRef)

  const visitedMarkerImage = new window.kakao.maps.MarkerImage(
    VISITED_MARKER_IMAGE_SRC,
    new window.kakao.maps.Size(32, 40),
    { offset: new window.kakao.maps.Point(16, 40) },
  )

  cafes
    .filter((cafe) => cafe.geocodeStatus === 'success' && cafe.lat !== null && cafe.lng !== null)
    .forEach((cafe) => {
      const isVisited = visitedKeys.has(buildVisitKey(cafe.name, cafe.address))

      const marker = new window.kakao.maps.Marker({
        map,
        position: new window.kakao.maps.LatLng(cafe.lat as number, cafe.lng as number),
        title: cafe.name,
        image: isVisited ? visitedMarkerImage : undefined,
      })

      window.kakao.maps.event.addListener(marker, 'click', () => {
        onMarkerClick(cafe)
      })

      markersRef.current.push(marker)
    })
}
