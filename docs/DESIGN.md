# 수산물 수출확인증명 통합 신청 플랫폼 (MMPA Smart-Pass)
## 설계서 — 통합본 (v5)

> **문서 위치**: 본 PoC의 단일 진실 공급원. 본 문서가 정의하지 않은 것은 PoC 범위 밖이다.

## 1. 프로젝트 정의

수출확인증명 신청 도메인의 **희소 룰셋**(국내산 `loff_id` 조합, 수입산 COA 등급)을 사람이 표로 찾는 대신 **입력 즉시 시스템이 판정**하도록 만든 로컬 PoC. 본 시스템은 CRUD 플랫폼이 아닌 **Rule-driven Interaction System**이다. 부차적으로, 본 PoC 구축 과정 자체를 Claude Code 스킬·하네스 워크플로의 실증 기록으로 남긴다.

### 1.1 목표 우선순위

| 순위 | 목표 | 측정 |
|---|---|---|
| 1차 | 도메인 룰셋의 실시간 판정 엔진 구현 | D1~D4 |
| 2차 | PoC 구축 과정의 회고 가능한 기록 | W1~W2 |

1차 미달 시 2차는 의미 없음. 회고는 결과물에 종속되어야 진짜 회고다.

---

## 2. Definition of Done

### 2.1 도메인 (D)

| # | 기준 | 검증 |
|---|---|---|
| D1 | 국내산·수입산 각 10건의 입력→판정이 정답과 일치 | `tests/` 통과 |
| D2 | 잘못된 조합 입력 시 반려 사유가 한국어 자연어로 출력 | 스냅샷 테스트 |
| D3 | 신청 데이터가 SQLite에 저장·재기동 후 조회 가능 | 수동 시연 |
| D4 | 룰셋 1건 변경 → 재기동 → UI 즉시 반영 (15분 이내) | 라이브 데모 |

### 2.2 워크플로 (W)

| # | 기준 | 검증 |
|---|---|---|
| W1 | `VIBE_CODING_LOG.md`에 의사결정 5건·트러블슈팅 3건 이상 기록 | 문서 리뷰 |
| W2 | 활용 스킬(`xlsx`, `frontend-design`)별 적용 사례 1건 이상 | 문서 리뷰 |

---

## 3. 범위 및 비목표

| 포함 | 제외 (Non-Goals) |
|---|---|
| 로컬 단일 머신 풀스택 동작 | 클라우드 배포·운영·모니터링 |
| 국내산·수입산 두 흐름의 Wizard | 인증·인가·전자서명 |
| 룰셋 기반 실시간 검증 | 룰셋 관리 GUI (소스 수정으로 갈음) |
| SQLite 신청 이력 저장·조회 | 다중 사용자 동시성, 트랜잭션 |
| 엔진 단위 테스트 | E2E·부하 테스트 |
| 한국어 UI | i18n, a11y 표준 준수 |

---

## 4. AS-IS vs TO-BE

| 축 | AS-IS | TO-BE | 기대 효과 |
|---|---|---|---|
| 진입점 | 국내/수입 메뉴 분리 | 단일 통합 화면 (Smart Router) | 경로 선택 혼란 제거 |
| 정보 입력 | 외부 표·고시 참조 수기 입력 | 실시간 룰셋 검증 (Real-time Validator) | 입력 오류 원천 차단 |
| 서류 안내 | 포괄적·정적 목록 | 케이스별 동적 안내 (Dynamic Guide) | 불필요 서류 제거 |
| 피드백 | 제출 후 반려로 확인 | 입력 단계별 즉각 피드백 | 반려율 감소, 심사 시간 단축 |

본 PoC의 본질: *오류를 보여주는 시스템이 아니라, 오류 상태에 진입하지 못하게 하는 시스템.*

---

## 5. 핵심 기능

| 기능 | 책임 | 사용자 체감 |
|---|---|---|
| Smart Router | 첫 화면에서 국내/수입 분기 + 폼 동적 전환 | 잘못된 창구 진입 방지 |
| Rule Resolver | 입력 조합 → 룰셋 조회 → 매칭 룰 식별 | 표·고시 참조 제거 |
| Real-time Validator | Resolver 결과를 `Verdict`로 포장 | 표 없이 신청 가능 |
| Dynamic Document Guide | `Verdict.documentTrack`에 따라 서류 영역 분기, `requiredDocs`를 UI에 렌더 | 불필요 서류 안내 제거 |
| Guided UX | 불가능 조합은 비활성화·다음 단계 차단 | 오류 상태 진입 불가 |

---

## 6. 도메인 모델

### 6.1 `Verdict` — 모든 검증 흐름의 수렴점

UI 배너·반려 사유·서류 안내·감사 로그가 이 타입 하나에서 파생된다.

```ts
// src/engine/types.ts
export type VerdictKind =
  | "eligible"     // 조합 확정
  | "ineligible"   // 룰셋에 없는 조합 (반려 사유 명시)
  | "conditional"  // 추가 입력/서류 필요 (missing 명시)
  | "unknown";     // 룰셋 미수록 (수동 검토 필요)

// 수입산 서류 체계 분기. 등급(L1/L2/L3)이 곧 서류 양의 단계가 아니라,
// L1·USA와 L2·L3은 서로 다른 서류 트랙을 따른다.
export type DocumentTrack =
  | "catch_certificate"   // L1 + USA: 어획증명서 (어법·선명·선박번호)
  | "coa";                // L2 + L3: 원료 생산국 발급 COA

export interface Verdict {
  kind: VerdictKind;
  loffId?: string;
  listGrade?: "L1" | "L2" | "L3";
  documentTrack?: DocumentTrack;    // 수입산 eligible 시 결정
  message: string;                  // 한국어 자연어
  missing?: string[];               // conditional 시 필요 항목
  requiredDocs?: string[];          // eligible 시 필요 서류
  matchedRuleId?: string;           // 감사 추적
  nextStepEnabled: boolean;         // FSM 전이 가능 여부
}
```

`listGrade`와 `documentTrack`은 독립이다. L1·USA는 `documentTrack: "catch_certificate"`, L2·L3은 `documentTrack: "coa"`. USA는 List 1에 명시되지 않지만 자료상 List 1과 동등 취급되므로 `listGrade: "L1"` + `documentTrack: "catch_certificate"`로 처리한다.

L3은 추가로 미적용 어업 입증 차원이 들어온다 (§6.2 `CoaInput`, §8.2 분기 참조).

### 6.2 룰셋

```ts
// src/rules/loff-ruleset.ts
export const LOFF_RULESET = [
  {
    id: "R-LOFF-0001",
    method: "naejam", species: "haliotis", region: "KR-26",
    loffId: "LOFF-NJ-HAL-26",
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },
] as const satisfies readonly LoffRule[];
```

- `as const satisfies` — 빌드타임 리터럴 타입 + 스키마 적합성 동시 강제
- `id` — 안정적 식별자 (감사 추적)
- `effectiveFrom/To` — 시간 의존성을 1급으로 모델링

### 6.3 엔진 — 순수 함수

```ts
export function verifyDomestic(
  input: Partial<DomesticInput>,
  asOf: Date = new Date()
): Verdict;

export function verifyCoa(
  input: Partial<CoaInput>,
  asOf: Date = new Date()
): Verdict;

// 수입산 입력 차원
export interface CoaInput {
  country: ISO3;                    // 원산지 (어획국)
  itemCd: string;                   // 품목 코드
  processingCountry: ISO3;          // 가공국
  fisheryExemption?: boolean;       // L3 국가에서만 의미. true=MMPA 미적용 어업 입증
}
```

- `Partial<Input>` — 부분 입력도 의미 있는 `Verdict` 반환
- `asOf` — 시간 의존성 외부 주입 (테스트 가능성)
- I/O 금지 — DB·네트워크는 호출자(라우터) 책임
- `fisheryExemption`은 L3 국가일 때만 검사. L1·L2 입력에서는 무시된다.

### 6.4 데이터 자산

| 데이터 | 형태 | 위치 |
|---|---|---|
| `applications` | SQLite 테이블 | `data/app.db` |
| `LOFF_RULESET` | TS 상수 | `src/rules/loff-ruleset.ts` |
| `COA_COUNTRY_LIST` | TS 상수 | `src/rules/coa-country-list.ts` |
| `REQUIRED_DOCS` | TS 상수 | `src/rules/required-docs.ts` |

---

## 7. Wizard 상태 머신 (FSM)

폼 데이터 상태(react-hook-form)와 **진행 상태(FSM)는 분리**된다.

```ts
type WizardStep =
  | "SELECT_TYPE"
  | "INPUT_RULE"
  | "VALIDATED"
  | "UPLOAD_DOCS"
  | "READY_TO_SUBMIT"
  | "SUBMITTED";
```

| 현재 | 전이 조건 | 다음 |
|---|---|---|
| `SELECT_TYPE` | 분기 선택 완료 | `INPUT_RULE` |
| `INPUT_RULE` | `Verdict.kind === "eligible"` | `VALIDATED` |
| `VALIDATED` | 서류 조건 확인 | `UPLOAD_DOCS` |
| `UPLOAD_DOCS` | 누락 없음 | `READY_TO_SUBMIT` |
| `READY_TO_SUBMIT` | 제출 완료 | `SUBMITTED` |

전이는 `Verdict.nextStepEnabled`로만 가능. 사용자가 다음 버튼을 눌러도 `Verdict`가 막으면 진행 불가.

---

## 8. 검증 흐름 (매 입력마다 좁히기)

### 8.1 국내산

```
[어법]              → conditional, missing: [species, region]
[어법 + 어종]        → conditional, missing: [region]
[어법 + 어종 + 해역] → eligible, loffId, requiredDocs
                  또는 ineligible
```

### 8.2 수입산

등급(L1/L2/L3)에 따라 서류 트랙과 적격 판정 규칙이 분기한다.

**공통 흐름**

```
[국가]                → conditional, listGrade 결정, missing: [item, processingCountry]
[+ 품목]              → conditional, missing: [processingCountry]
[+ 가공국]            → 등급별 분기 (아래)
```

**등급별 분기**

| 국가 | 추가 입력 | 결과 | documentTrack |
|---|---|---|---|
| L1 또는 USA | (없음) | `eligible` | `catch_certificate` |
| L2 | (없음) | `eligible` | `coa` |
| L3 | `fisheryExemption: true` | `eligible` (항구 추가 심사 전제) | `coa` |
| L3 | `fisheryExemption` 미입력/false | `ineligible` (원칙 수입 금지) | — |
| 목록 외 | — | `unknown` | — |

L3는 원칙적으로 수입 금지이나, MMPA 미적용 어업에서 생산된 것이 입증되면 COA 제출 가능. UI는 L3 선택 시 미적용 어업 체크박스를 노출한다.

배지 색상(§9)은 등급 표시일 뿐 적격성이 아니다. L2 황색·L3 적색이어도 조건 충족 시 eligible 진입.

UI 측에서 300ms 디바운스. API 호출은 디바운스 종료 시점에만.

---

## 9. UX 디테일

| 상황 | 시각 처리 |
|---|---|
| 어법 선택 후 가능 어종 | 활성화 (드롭다운 정상색) |
| 어법 선택 후 불가능 어종 | `disabled` + 회색 처리 (선택 불가) |
| `Verdict.kind === "eligible"` | 상단 녹색 배지 슬라이드 인 |
| `Verdict.kind === "ineligible"` | 상단 적색 배지 + 반려 사유 노출 |
| `listGrade: "L1"` 또는 USA | 녹색 Badge + "어획증명서" 업로드 영역 노출 |
| `listGrade: "L2"` | 황색 Badge + "COA" 업로드 영역 노출 |
| `listGrade: "L3"` | 적색 Badge + 경고 배너 + "미적용 어업입니까?" 체크박스 |
| L3 + 미적용 어업 체크 | "COA + 미적용 어업 입증서 + 항구 심사 동의서" 3건 업로드 영역 |
| L3 + 일반 어업 | 업로드 영역 차단, 반려 사유 노출 |
| `nextStepEnabled === false` | 다음 버튼 잠금 (커서 not-allowed) |
| 검증 진행 중 (디바운스 대기) | 입력창 우측 스피너 |

모든 색상은 Shadcn 디자인 토큰 기본값만 사용. 커스텀 CSS 금지.

---

## 10. 기술 스택

| 영역 | 선택 | 사유 |
|---|---|---|
| 패키지 매니저 | pnpm | 단일 명령으로 dev 기동 |
| 런타임 | Node.js 20 LTS | 별도 인프라 불필요 |
| 프론트엔드 | **Vite + React 18** | Wizard 5단계에 Next.js는 과잉 |
| 백엔드 | **Hono on Node.js** | 경량·타입 안전. 단일 라우터 |
| 검증 | Zod | 룰셋 런타임 + API 입력 양쪽 |
| 폼 데이터 | react-hook-form | Wizard 폼 입력값 |
| 진행 상태 | `useReducer` (FSM) | 별도 상태 라이브러리 불필요 |
| UI | Tailwind + Shadcn/ui | 디자인 비용 최소화 |
| DB | **SQLite + better-sqlite3** | ORM 부채 회피, raw SQL |
| 룰셋 표현 | TS `as const satisfies` | 빌드타임 + 런타임 이중 보장 |

### 10.1 로컬 구성

```
pnpm dev
  ├─ Vite      (5173)  — UI
  └─ Hono/Node (8787)  — API → SQLite (./data/app.db)
```

CORS는 Vite dev proxy로 처리 (`/api → http://localhost:8787`).

---

## 11. 프로젝트 구조

```
mmpa-smartpass/
├── CLAUDE.md
├── package.json (단일)
├── src/
│   ├── contracts/          # 프론트-백엔드 공유 타입
│   │   ├── requests.ts
│   │   └── responses.ts    # Verdict 등
│   ├── rules/              # TS 상수만. 함수 금지.
│   │   ├── schema.ts       # Zod 스키마
│   │   ├── loff-ruleset.ts
│   │   ├── coa-country-list.ts
│   │   └── required-docs.ts
│   ├── engine/             # 순수 함수만. I/O 금지.
│   │   ├── types.ts
│   │   ├── domestic.ts
│   │   ├── coa.ts
│   │   └── documents.ts
│   ├── api/                # Hono 서버
│   │   ├── server.ts
│   │   ├── db.ts           # better-sqlite3 raw
│   │   └── routes/
│   └── ui/                 # Vite + React
│       ├── main.tsx
│       ├── wizard/         # FSM reducer + Steps
│       └── components/
├── tests/
│   ├── domestic.test.ts
│   ├── coa.test.ts
│   └── fixtures/           # D1 충족용 케이스
├── data/app.db             # gitignore
└── docs/
    ├── DESIGN.md           # 본 문서
    ├── DOMAIN.md
    ├── DECISIONS.md
    └── VIBE_CODING_LOG.md
```

레이어 규칙:
- `src/rules/` 데이터만 / `src/engine/` 순수 함수만
- `src/api/`만 I/O 보유 / `src/ui/`는 백엔드 직접 import 금지

---

## 12. 실패 전략

| 상황 | 대응 |
|---|---|
| 룰셋에 없는 조합 | `Verdict.kind = "ineligible"` + 반려 사유 자연어 |
| 룰셋에 미수록 신규 케이스 | `Verdict.kind = "unknown"` + 수동 검토 안내 |
| `Verdict.nextStepEnabled === false` | 다음 버튼 잠금, 사용자 진행 차단 |
| 서류 누락 | 제출 버튼 비활성, 누락 항목 강조 |
| SQLite write 실패 | UI에 "임시 저장 실패" 토스트, 재시도 버튼 |
| Zod 룰셋 검증 부트 실패 | 서버 기동 거부, 콘솔에 위반 행 출력 |

---

## 13. 룰셋 거버넌스 (PoC 범위)

룰셋 갱신 절차:

1. 원본 xlsx 수령
2. `xlsx` 스킬로 TS 상수 재생성
3. `src/rules/schema.ts` Zod 검증 통과
4. `tests/` 회귀 통과
5. 재기동

실서비스화 시 별도 룰셋 관리 DB와 승인 워크플로 필요하나 **본 PoC 범위 밖.**

---

## 14. 바이브 코딩 워크플로

### 14.1 작업 단위

| 작업 | 1 프롬프트 범위 | 검증 | 스킬 |
|---|---|---|---|
| 룰셋 데이터 | 단일 파일, 200 LOC | Zod + 샘플 5건 | `xlsx` |
| 엔진 함수 | 단일 함수 + 테스트 | 테이블 테스트 | — |
| API 라우트 | 단일 라우트 + Zod | curl | — |
| UI 컴포넌트 | 단일 컴포넌트, 150 LOC | 수동 렌더 | `frontend-design` |

### 14.2 원칙

- 1 프롬프트 = 1 파일 = 1 책임
- 스킬 우선 확인 (`SKILL.md` 먼저 view)
- 점진적 빌드, 거대 PR 금지
- `CLAUDE.md`로 규칙 고정

### 14.3 권장 프롬프트

```
[Good]
"src/rules/coa-country-list.ts 작성.
schema.ts의 CoaCountryRule 참고.
국가 코드 ISO 3166-1 alpha-3.
as const satisfies 적용.
샘플 5건. 100 LOC 이내."

[Good — UI]
"src/ui/wizard/steps/ImportStep.tsx 작성.
국가 입력 시 Hono API 호출 말고 verifyCoa() 직접 import.
listGrade에 따라 Shadcn Badge 색상 분기 (L1 green / L2 yellow / L3 red).
300ms debounce 적용. 150 LOC 이내."

[Bad]
"수출 시스템 전체 만들어줘"
```

---

## 15. 트러블슈팅 (사전 예측)

회고를 사후에 짜내지 않기 위한 예측 슬롯. 실제 발생한 것만 채운다.

| 예상 포인트 | 확인 | 해결 프롬프트 |
|---|---|---|
| `as const satisfies` 누락 → string 추론 | `tsc --noEmit` | "이 파일에 `as const satisfies LoffRule[]` 적용. 추론 타입 확인." |
| Zod 스키마 ↔ TS 상수 드리프트 | 부트 시 검증 실패 | "schema.ts 갱신 + 룰셋 파일들 재검증. 위반 행 출력." |
| Vite ↔ Hono 포트 분리로 CORS | 첫 API 호출 | "vite.config.ts의 server.proxy로 `/api → 8787` 프록시 설정." |
| Claude Code가 `rules/`에 함수 끼워 넣음 | 코드 리뷰 | "`src/rules/`는 데이터만. 함수 제거하고 `engine/`으로 이동." |
| `asOf` 미전달로 시간 의존성 누락 | 미래/과거 날짜 테스트 | "verifyDomestic 호출부에 asOf 명시. 기본값 의존 금지." |
| 룰셋 100건 초과 시 선형 탐색 | 측정 | "loffId 키로 Map 생성, 조회 O(1)화." |

---

## 16. 테스트 전략

CRUD가 아닌 **규칙 검증 정확도**가 핵심이므로 엔진 우선 테스트.

```
tests/
├── domestic.test.ts        # 테이블 기반, D1 충족용 10건
├── coa.test.ts             # 테이블 기반, D1 충족용 10건
├── documents.test.ts       # requiredDocs 매트릭스
└── fixtures/
    ├── domestic-cases.json
    └── coa-cases.json
```

각 케이스는 `{ input, expectedVerdict }` 형태. 룰셋 변경 시 fixture만 갱신하면 회귀 검증 가능.

---

## 17. 첫 1주 작업 순서

각 단계마다 D# 또는 W# 항목이 닫혀야 다음 진행.

| Day | 작업 | 닫힘 |
|---|---|---|
| 1 AM | `CLAUDE.md`, `DOMAIN.md`, `DESIGN.md` 확정 | — |
| 1 PM | `rules/schema.ts` + `loff-ruleset.ts` 샘플 20행 | — |
| 2 AM | `engine/types.ts`, `domestic.ts` + 테스트 | D1 일부 |
| 2 PM | `engine/coa.ts` + 테스트, `coa-country-list.ts` | D1 완료 |
| 3 | Hono 서버 + `/api/verify/*` + curl 시연 | D2 완료 |
| 4 | Vite + React, FSM reducer, `BranchSelect`, `DomesticForm` | — |
| 5 | `ImportForm`, `DocumentUpload`, `Review` + SQLite 저장 | D3 완료 |
| 6 | 룰셋 디버그 뷰, 신청 이력 조회, 룰셋 갱신 시연 | D4 완료 |
| 7 | `VIBE_CODING_LOG.md`, `DECISIONS.md` 정리, 데모 | W1·W2 완료 |

---

## 18. 기대 효과

| 대상 | 효과 |
|---|---|
| PoC 평가자 | 바이브 코딩 워크플로 실증 사례 확보 |
| (가상) 민원인 | 표 참조 불필요, 즉시 가능 여부 확인, 반려 감소 |
| (가상) 심사 담당자 | 사전 검증된 데이터 접수로 심사 시간 단축 |
| 향후 실서비스화 | 엔진(순수 함수) 재사용, UI·인프라만 교체 가능 |

---

**문서 버전**: v6
**상태**: 확정. 이후 변경은 `docs/DECISIONS.md`에 ADR로 기록.

**v6 변경점** (국가별 동등성 평가 결과 자료 반영):
- §5 Dynamic Document Guide: `documentTrack` 분기 책임 명시
- §6.1 `Verdict`: `documentTrack` 필드 추가 (`catch_certificate` | `coa`)
- §6.3 엔진: `verifyCoa` 시그니처와 `CoaInput` 차원 추가 (`fisheryExemption`)
- §8.2 수입산 흐름: 등급별 분기 재설계, L3 미적용 어업 분기 도입
- §9 UX: 등급별 서류 영역 분기 반영, L3 체크박스 UX 명시
