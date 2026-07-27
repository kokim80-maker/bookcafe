# 우리 동네 카페 지도

엑셀로 정리해두던 동네 카페 목록을 카카오맵 위에 시각화하고, 로그인한 사용자가 방문 여부와 한줄 소감을 개인 기록으로 남길 수 있는 웹 서비스입니다.

자세한 요구사항은 [PRD.md](./PRD.md), 개발 규칙은 [CLAUDE.md](./CLAUDE.md)를 참고하세요.

## 주요 기능

- 관리자가 업로드한 엑셀 카페 목록(이름/주소/카테고리)을 카카오맵 위에 마커로 표시
- 카카오맵 JS SDK 지오코딩으로 주소 → 좌표 변환 (순차 처리, 실패 주소는 별도 목록 안내)
- 마커 클릭 시 방문 여부 체크 + 한줄 소감 작성 (로그인 사용자 전용, upsert로 장소당 1건 유지)
- 로그인/회원가입 (Supabase Auth 이메일+비밀번호)
- "방문한 카페" 목록 화면 — 본인이 체크한 카페만 모아보기

## 기술 스택

- React + Vite + TypeScript
- Tailwind CSS v4 + shadcn/ui
- 카카오맵 JavaScript SDK (services 라이브러리)
- Supabase (Auth + Postgres + RLS)
- xlsx (엑셀 파싱)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.example`을 복사해 `.env` 파일을 만들고 값을 채웁니다.

```bash
cp .env.example .env
```

| 변수 | 설명 |
|---|---|
| `VITE_KAKAO_MAP_KEY` | 카카오맵 JavaScript SDK 앱 키 (카카오 개발자센터) |
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (RLS로 접근이 제어되므로 클라이언트 노출 가능) |

`.env`는 `.gitignore`에 포함되어 있어 저장소에 커밋되지 않습니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

기본적으로 `http://localhost:5173`에서 확인할 수 있습니다.

## 스크립트

| 명령어 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 타입 체크(`tsc -b`) 후 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 로컬 미리보기 |
| `npm run lint` | oxlint 실행 |

## 프로젝트 구조

```
src/
  components/     화면 구성 요소 (Header, MapView, CafeCard, CafeVisitDialog 등)
  components/ui/  shadcn/ui 프리미티브
  lib/            카카오맵 SDK 로더, 지오코딩, Supabase 클라이언트/인증, visit_notes 연동
  data/           목 데이터 (mockCafes)
  types/          Cafe, Visit 등 타입 정의
```

## 데이터 모델

- `cafes`: 관리자가 엑셀로 업로드하는 공용 카페 목록 (재업로드 시 전체 교체)
- `visit_notes`: 사용자별 방문 체크 + 한줄 소감 (RLS로 본인 행만 조회/작성 가능, `(user_id, place_name, address)` 유일 제약)

자세한 스키마와 RLS 정책은 [PRD.md 7장, 8장](./PRD.md#7-데이터-모델-supabase)을 참고하세요.
