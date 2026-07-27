import type { Cafe } from '@/types/cafe'

export const mockCafes: Cafe[] = [
  {
    id: 'cafe-1',
    name: '시청 커피',
    address: '서울 중구 세종대로 110',
    category: '커피전문점',
    lat: 37.5665,
    lng: 126.978,
    geocodeStatus: 'success',
  },
  {
    id: 'cafe-2',
    name: '정동 로스터리',
    address: '서울 중구 정동길 26',
    category: '로스터리',
    lat: 37.5658,
    lng: 126.9738,
    geocodeStatus: 'success',
  },
  {
    id: 'cafe-3',
    name: '덕수궁 브런치카페',
    address: '서울 중구 세종대로 99',
    category: '브런치카페',
    lat: 37.5645,
    lng: 126.9749,
    geocodeStatus: 'success',
  },
  {
    id: 'cafe-4',
    name: '무교동 스터디카페',
    address: '서울 중구 무교로 20',
    category: '스터디카페',
    lat: 37.5678,
    lng: 126.9805,
    geocodeStatus: 'success',
  },
]
