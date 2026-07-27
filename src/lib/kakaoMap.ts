const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY

export const SEOUL_CITY_HALL_CENTER = { lat: 37.5665, lng: 126.978 }

let kakaoSdkPromise: Promise<void> | null = null

export function loadKakaoMapSdk(): Promise<void> {
  if (window.kakao?.maps) {
    return Promise.resolve()
  }

  if (!kakaoSdkPromise) {
    kakaoSdkPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&libraries=services&autoload=false`
      script.onload = () => window.kakao.maps.load(() => resolve())
      script.onerror = () => reject(new Error('카카오맵 SDK를 불러오지 못했습니다.'))
      document.head.appendChild(script)
    })
  }

  return kakaoSdkPromise
}
