# FIT-career (핏커리어)

피트니스 업계 채용/커뮤니티 플랫폼. 구인·구직, 이력서, 기업 프로필, 중고마켓 기능을 제공하며 `fitcareer.co.kr`에 배포됨.

## 필수 명령어

```bash
npm run dev       # Turbopack 개발 서버
npm run build     # 프로덕션 빌드
npm run lint      # ESLint + TypeScript 체크
ANALYZE=true npm run build  # 번들 분석
```

## 기술 스택

- **Framework**: Next.js App Router (RSC 우선)
- **Language**: TypeScript 5 (`noImplicitAny: false` — any 허용)
- **Styling**: Tailwind CSS + shadcn/ui (base: slate, CSS variables 테마)
- **Font**: Pretendard (로컬 WOFF2, `--font-pretendard` CSS 변수)
- **Backend**: Supabase (Auth, PostgreSQL, Storage)
- **서버 상태**: TanStack Query v5
- **클라이언트 상태**: Zustand
- **배포**: Vercel

## 핵심 디렉토리

```
api/           # TanStack Query 훅 + Supabase 호출 (컴포넌트와 분리)
app/           # Next.js 라우트 (App Router)
components/
  common/      # 공통 UI (Nav, Footer, Dialog, TextEditor 등)
  hiring/      # 채용 관련 컴포넌트
  my-page/     # 마이페이지 컴포넌트
utils/supabase/
  client.ts    # 브라우저용 Supabase 클라이언트
  server.ts    # 서버용 Supabase 클라이언트 (admin 모드 지원)
types/         # TypeScript 인터페이스 (auth, hiring, resume)
constant/      # 정적 데이터 (직종, 지역)
functions/     # 순수 유틸리티 함수
```

## 데이터 페칭 패턴

모든 데이터 페칭은 `/api/*.ts`에 집중됨 — 컴포넌트 내부에 직접 Supabase 호출 금지.

```typescript
// 패턴: 순수 함수 → useQuery/useMutation 래핑
async function fetchHiring(id: string) { /* Supabase 호출 */ }

export function useGetHiring(id: string) {
  return useQuery({ queryKey: ['hiring', id], queryFn: () => fetchHiring(id) })
}
```

뮤테이션 훅에는 toast 알림, router 이동, queryClient 무효화가 포함됨.

## 서버/클라이언트 컴포넌트 규칙

- 기본값은 **Server Component** (RSC)
- 인터랙티브 컴포넌트는 파일 최상단에 `'use client'` 명시
- 보호 라우트는 서버에서 인증 확인 후 `redirect()` 처리
- 서버 액션은 `api/server-action.ts` (`'use server'` 마킹)

## Supabase 클라이언트 사용 규칙

- `'use client'` 컴포넌트 / 쿼리 훅 → `createBrowserSupabaseClient()`
- RSC 페이지 / 미들웨어 / 라우트 핸들러 → `createServerSupabaseClient()`
- admin 작업만 service role key 사용 (서버 사이드 전용)

## 캐싱 전략

채용 목록 페이지는 `force-static` + on-demand ISR 패턴:

```typescript
// app/hiring/page.tsx
export const dynamic = 'force-static'
export const revalidate = false
```

데이터 변경 후 `/api/revalidate` 라우트로 `revalidateTag('hiring')` 호출.

## 상태 관리

- **서버 데이터** → TanStack Query (`['userData']`, `['hiring', id]` 등 키 패턴)
- **필터 상태** → `useSessionStorage` (sessionStorage에 지속)
- **UI 전역 상태** → Zustand (message.alert/confirm 등)

## UI 컴포넌트 규칙

- 아이콘: `lucide-react` 사용
- 유틸리티: `cn()` from `@/lib/shadcn/utils` (clsx + tailwind-merge)
- Alert/Confirm: `window.alert/confirm` 대신 `message.alert()` / `message.confirm()` 사용
- 다크모드 설정은 있으나 현재 UI에서 토글하지 않음

## 주요 주의사항

- `noImplicitAny: false`이므로 TypeScript가 any를 허용하지만, 명시적 타입 정의 권장
- 이력서 데이터는 `hiring` 테이블의 `resume_received` JSONB 컬럼에 비정규화 저장됨
- 이미지 업로드 전 `browser-image-compression`으로 클라이언트 사이드 압축
- 한국 주소 검색: `react-daum-postcode`, 지도: `react-kakao-maps-sdk`
- 프로덕션 빌드에서 `removeConsole` 자동 적용됨 — `console.log` 디버깅은 개발 환경에서만 유효
