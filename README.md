# MMPA Smart-Pass

수산물 수출확인증명 통합 신청 플랫폼 — Rule-driven Interaction System PoC

> 오류를 보여주는 시스템이 아니라, 오류 상태에 진입하지 못하게 하는 시스템.

## 개요

국내산·수입산 수산물 수출확인증명 신청 시 담당자가 수기로 표·고시를 참조하던 과정을 **입력 즉시 시스템이 판정**하도록 대체한 로컬 PoC입니다.

- 국내산: 어법 × 어종 × 해역 조합 → `loff_id` 자동 결정
- 수입산: 원산지 국가 × 품목 → COA 등급(L1/L2/L3) + 적격 여부 판정
- 모든 판정은 `Verdict` 타입으로 수렴 → 서류 안내·다음 단계 버튼 잠금 연동

## 스택

| 영역 | 기술 |
|---|---|
| 프론트엔드 | Vite + React 18 (포트 5173) |
| 백엔드 | Hono on Node.js (포트 8787) |
| DB | SQLite + better-sqlite3 (raw SQL, ORM 없음) |
| UI | Tailwind CSS v3 + Shadcn/ui |
| 패키지 매니저 | pnpm |
| 룰셋 표현 | TypeScript `as const satisfies` |

## 시작하기

```bash
# 의존성 설치
pnpm install

# 개발 서버 (프론트 5173 + 백엔드 8787 동시 기동)
pnpm dev
```

브라우저에서 `http://localhost:5173` 접속.

## 주요 명령어

```bash
pnpm test        # 엔진 단위 테스트 (vitest)
pnpm typecheck   # TypeScript 타입 검사
pnpm build       # 프론트엔드 프로덕션 빌드
```

## 프로젝트 구조

```
src/
├── rules/      # TS 상수만 (함수 금지) — 룰셋 데이터
├── engine/     # 순수 함수만 (I/O 금지) — 판정 로직
├── api/        # Hono 라우터 + SQLite — I/O 담당
├── ui/         # React UI — /api/* HTTP만 호출
└── contracts/  # 프론트-백엔드 공유 타입
```

레이어 간 의존 방향: `ui` → (HTTP) → `api` → `engine` ← `rules`

## Verdict 타입

모든 검증 흐름이 수렴하는 단일 타입.

```ts
type VerdictKind =
  | "eligible"     // 조합 확정, 다음 단계 활성화
  | "ineligible"   // 반려 (한국어 사유 포함)
  | "conditional"  // 추가 입력 필요 (missing[] 명시)
  | "unknown";     // 룰셋 미수록, 수동 검토 안내
```

## 설계 문서

| 문서 | 내용 |
|---|---|
| [`docs/DESIGN.md`](docs/DESIGN.md) | 전체 설계서 (단일 진실 공급원) |
| [`docs/DOMAIN.md`](docs/DOMAIN.md) | 도메인 지식 |
| [`docs/DB.md`](docs/DB.md) | DB 스키마 명세 |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | 의사결정 기록 (ADR) |
| [`docs/VIBE_CODING_LOG.md`](docs/VIBE_CODING_LOG.md) | 코딩 로그 |

## 테스트

```
tests/
├── domestic.test.ts   # 국내산 판정 10건
├── coa.test.ts        # 수입산 판정 10건
├── documents.test.ts  # 필요 서류 매트릭스
└── fixtures/          # { input, expectedVerdict } JSON
```