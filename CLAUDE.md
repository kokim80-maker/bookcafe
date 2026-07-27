# CLAUDE.md

이 파일은 Claude Code(claude.ai/code)가 이 저장소에서 작업할 때 참고하는 안내 문서입니다.

## 프로젝트 현황

React + Vite + TypeScript 스캐폴드가 준비되어 있고(Tailwind v4, shadcn/ui 적용), 헤더/지도/카페 목록 카드로 이루어진 화면 뼈대가 하드코딩된 가짜 데이터로 동작합니다. 엑셀 업로드, 실제 지오코딩, Supabase 연동(인증/RLS)은 아직 연결되지 않았습니다.

### 명령어
- `npm install` — 의존성 설치
- `npm run dev` — 개발 서버 실행 (기본 `http://localhost:5173`)
- `npm run build` — 타입 체크(`tsc -b`) 후 프로덕션 빌드
- `npm run preview` — 빌드 결과 로컬 미리보기
- `npm run lint` — oxlint 실행
- 단일 테스트 명령: 아직 테스트 러너가 설정되어 있지 않음

### 코드 구조
- `src/components/` — `Header`, `MapView`, `CafeListSection`, `CafeCard` 등 화면 구성 요소. shadcn/ui 프리미티브는 `src/components/ui/`
- `src/lib/kakaoMap.ts` — 카카오맵 SDK 로더(`loadKakaoMapSdk`)와 기본 중심 좌표(`SEOUL_CITY_HALL_CENTER`)
- `src/types/` — `Cafe`, `Visit` 타입 (PRD 7장의 `cafes`/`visits` 스키마와 필드 대응, camelCase)
- `src/data/mockCafes.ts` — 실제 연동 전 사용하는 하드코딩된 카페 배열
- 경로 별칭 `@/*` → `./src/*` (`tsconfig.json`, `tsconfig.app.json`, `vite.config.ts`에서 설정)

코드를 작성하기 전에 반드시 PRD.md 전체를 읽으세요. 범위와 설계 결정에 대한 단일 진실 공급원(source of truth)이며, 핵심 내용은 다음과 같습니다.

- **데이터 소유권 모델**: 카페 목록(`cafes`)은 관리자가 엑셀로 업로드하는 공용/공유 데이터이며, 방문 체크와 한줄 소감(`visits`)은 사용자별 개인 데이터입니다.
- **아키텍처**: Vercel 위의 별도 백엔드 없는 구조 — Supabase(Auth + Postgres + RLS)를 BaaS로 사용하고, 카카오맵 JavaScript SDK를 브라우저에서 직접 호출해 지도 렌더링과 지오코딩을 모두 처리합니다(서버 사이드 지오코딩 프록시 없음).
- **핵심 불변 조건**: 한 사용자는 카페 하나당 `visits` 행을 최대 1개만 가지며, `cafes.id`가 아니라 `(user_id, cafe_name, cafe_address)` 조합으로 매칭됩니다. 엑셀 재업로드 시 `cafes` 테이블 전체가 교체(덮어쓰기 정책)되므로, id로 연결하면 개인 기록이 고아 데이터가 되기 때문입니다.
- **RLS 정책 구조**: `cafes`는 비회원을 포함해 누구나 읽기 가능하지만 쓰기는 관리자만 가능합니다. `visits`는 `auth.uid() = user_id`인 행으로만 완전히 제한됩니다.
- **미확정 사항**: PRD.md 13장에 관리자 판별 방식, 엑셀 템플릿 규칙, 업로드 용량 제한 등 아직 결정되지 않은 항목이 정리되어 있습니다. 해당 기능을 구현하기 전에 사용자에게 먼저 확인해야 합니다.

## 구현 규칙

아래는 이 프로젝트의 강제 제약사항이며 단순 권장사항이 아닙니다 — 당장 더 쉬운 방법이 보이더라도 반드시 지키세요.

### 환경변수
## 반드시 지킬 규칙
- 카카오맵 키는 `.env`의 `VITE_KAKAO_MAP_KEY`로 관리한다.
- 카카오맵 SDK는 `libraries=services`를 포함해서 불러온다
  (주소→좌표 변환에 필요).
- Supabase URL과 anon key는 `.env`의 `VITE_SUPABASE_URL`,
  `VITE_SUPABASE_ANON_KEY`로 관리한다.
- 소감 테이블은 RLS를 켜고 "본인 데이터만" 정책을 적용한다.
- `.env`는 `.gitignore`에 포함한다.
- 화면은 가짜 데이터로 먼저 만들고, 마지막에 실제 연동으로 교체한다.
- 마커를 다시 그릴 때는 이전 마커를 모두 지운 뒤 새로 그린다.
- 주소→좌표 변환은 하나씩 순서대로, 실패는 화면에 안내한다.
- 소감 저장은 upsert로, 같은 장소(이름+주소) 기록은 1개만 유지한다.
- Supabase 관련 작업(테이블, RLS)은 Supabase MCP 도구로 수행한다.



### 개발 순서
- 화면(컴포넌트)은 가짜/목 데이터(하드코딩한 카페 목록, 가짜 로그인 상태)로 먼저 완성합니다. 실제 카카오맵 연결, 엑셀 파싱, Supabase 연동은 UI 형태가 확정된 뒤 마지막에 붙입니다.

### 지도 마커
- 마커를 다시 그릴 때(새 지오코딩 결과 반영, 카페 목록 갱신 등)는 이전에 그려둔 마커를 전부(`setMap(null)`) 지운 뒤에만 새로 그립니다. 마커 인스턴스는 React state가 아니라 ref/배열에 보관하고, 마커가 겹쳐 쌓이는 일이 없도록 합니다.
- 카카오 지도 인스턴스는 한 번만 초기화합니다(재렌더링 시 재생성 방지). 렌더링될 때마다 `kakao.maps.Map`을 새로 만들지 않습니다.

### 지오코딩
- 주소는 한 번에 여러 개를 동시에 처리하지 말고, 하나씩 순서대로(이전 호출을 await한 뒤 다음 호출) 처리합니다. 변환에 실패한 주소는 조용히 버리지 말고 모아서 사용자에게 목록으로 보여줍니다.
- 카카오 지오코더 API는 콜백 기반입니다. 각 호출을 Promise로 감싸고, 결과를 읽기 전에 `status === kakao.maps.services.Status.OK`인지 확인하세요. OK가 아닌 상태는 예외를 던지지 말고 실패한 주소로 처리합니다.

### 소감(`visits`) 데이터
- 소감 저장은 일반 `insert`가 아니라 `(user_id, cafe_name, cafe_address)`를 키로 하는 `upsert`로 합니다 — 같은 사람의 같은 장소(이름+주소) 기록은 항상 1개 행으로 유지되어야 합니다.
- `upsert`의 `onConflict` 대상은 `(user_id, cafe_name, cafe_address)`에 실제로 일치하는 `UNIQUE` 제약/인덱스가 있어야만 동작합니다. 이게 없으면 Supabase는 에러 없이 조용히 중복 행을 insert합니다.
- `visits` 테이블은 반드시 RLS(행 수준 보안)를 **활성화**해야 합니다(`ALTER TABLE ... ENABLE ROW LEVEL SECURITY` — 정책을 작성해도 RLS 자체는 기본적으로 꺼져 있습니다). select/insert/update를 `auth.uid() = user_id`인 행으로만 제한하는 정책을 함께 적용합니다. 로그인한 사용자는 오직 본인의 소감만 조회/수정할 수 있어야 합니다.
- "이 소유자가 맞는지", "관리자인지" 같은 클라이언트 사이드 체크는 UI 편의 기능일 뿐, 실제 보안 경계로 취급하지 않습니다 — 버튼을 숨기는 것은 접근 제어가 아닙니다. 실제 권한 경계는 항상 RLS 정책이어야 합니다(이는 `cafes` 테이블의 관리자 쓰기 정책에도 동일하게 적용됩니다).

### 엑셀 재업로드(카페 목록 덮어쓰기)
- "덮어쓰기"를 클라이언트에서 두 번의 별도 호출(전체 삭제 후 전체 insert)로 구현하지 않습니다 — 그 사이에 페이지가 로드되면 빈 지도가 보이게 됩니다. 하나의 트랜잭션으로 감싼 Supabase RPC(Postgres 함수)로 구현하여 교체가 원자적으로 이루어지게 합니다.

### Supabase 스키마 작업
- 테이블 생성, 컬럼 추가, RLS 정책 작성/수정, RPC 함수 생성 등 Supabase 관련 작업은 모두 Supabase MCP 도구를 통해 수행하며, 이를 거치지 않고 SQL을 직접 손으로 편집하지 않습니다.

## 이 저장소에서 작업하기

엑셀 파싱, 실제 카카오 지오코딩, Supabase 인증/데이터 연동을 붙일 때는 위 "구현 규칙"에 정리된 제약(순차 지오코딩, 마커 전체 재생성, upsert, RLS 등)을 그대로 지키고, 새로 드러나는 아키텍처 패턴이 있으면 이 파일에 계속 추가하세요.

## 기술 스택
React + Vite, Tailwind + shadcn/ui, xlsx, 카카오맵 JS SDK,
Supabase(Auth/Database, MCP로 관리)
