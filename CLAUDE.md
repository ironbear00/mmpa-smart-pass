@AGENTS.md

# MMPA Smart-Pass — Claude 작업 규칙

## 설계 문서 (작업 전 항상 확인)
- 단일 진실 공급원: `MMPA_SmartPass.md` (= docs/DESIGN.md)
- DB 설계: `docs/DB.md`
- 테스트 데이터 가이드: `docs/TEST_DATA.md`
- 도메인 지식: `docs/DOMAIN.md`
- 의사결정 기록: `docs/DECISIONS.md`
- 코딩 로그: `docs/VIBE_CODING_LOG.md`

## 기술 스택 (변경 불가)
- Frontend: **Vite + React 18** (포트 5173). Next.js 절대 사용 금지.
- Backend: **Hono on Node.js** (포트 8787)
- 패키지 매니저: **pnpm**
- UI: **Tailwind CSS v3 + Shadcn/ui**. 커스텀 CSS 금지. 디자인 토큰 기본값만.
- DB: **SQLite + better-sqlite3**. ORM 금지. raw SQL만.

## 레이어 규칙 (절대 준수)
- `src/rules/` — **TS 상수만**. 함수 절대 금지. 내보내기는 `const`만.
- `src/engine/` — **순수 함수만**. DB·네트워크 I/O 절대 금지. `import`도 금지.
- `src/api/` — I/O 허용 (Hono 라우터, better-sqlite3)
- `src/ui/` — `src/engine/`, `src/api/` 직접 import 금지. `/api/*` HTTP만.
- `src/contracts/` — 프론트-백엔드 공유 타입. 함수 금지.

## 코딩 원칙
- 1 프롬프트 = 1 파일 = 1 책임
- UI 컴포넌트 150 LOC 이내, 룰셋 데이터 200 LOC 이내
- 룰셋 상수: `as const satisfies readonly RuleType[]` 필수
- 엔진 함수: `asOf: Date = new Date()` 파라미터 필수 (기본값 의존 금지)
- 모든 검증 결과는 `Verdict` 타입으로 수렴 (`src/engine/types.ts`)
- UI 입력 디바운스 300ms 후 API 호출
- Shadcn 디자인 토큰 기본값만. 커스텀 색상 금지.

## Verdict 종류
- `eligible`: 조합 확정, nextStepEnabled=true
- `ineligible`: 룰셋 없음, 한국어 반려 사유 필수
- `conditional`: 입력 부분, missing[] 필수
- `unknown`: 룰셋 미수록 신규 케이스, 수동 검토 안내