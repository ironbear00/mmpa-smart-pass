# Architecture Decision Records (ADR)

> `MMPA_SmartPass.md` §18 기준. 설계 변경은 반드시 ADR로 기록.
> 형식: 날짜 / 상태(확정·검토중·폐기) / 맥락 / 결정 / 근거 / 결과

---

## ADR-001: 기술 스택 선택

**날짜**: 2026-05-15
**상태**: 확정

**맥락**: 수산물 수출확인증명 5단계 Wizard PoC. 로컬 단일 머신, 단일 사용자, SQLite.

**결정**: Vite + React 18 / Hono on Node.js / Zod / react-hook-form / useReducer(FSM) / better-sqlite3 / pnpm.

**근거**:
- Next.js: Wizard 5단계 SPA에 SSR 불필요. 과잉.
- Hono: 경량, 타입 안전, 단일 라우터 파일로 충분.
- better-sqlite3: ORM 부채 없이 raw SQL. 동기 API로 PoC에 적합.
- react-hook-form: 폼 상태 관리. FSM(useReducer)과 분리.
- pnpm: `pnpm dev` 한 명령으로 UI+API 동시 기동.

**결과**: D1~D4 모두 해당 스택으로 구현 완료. Next.js 대비 번들 크기 감소, 개발 서버 기동 속도 향상.

---

## ADR-002: documentTrack 필드 도입 — 등급과 서류 체계 분리

**날짜**: 2026-05-15
**상태**: 확정

**맥락**: 초기 설계에서 수입산 서류를 `listGrade`(L1/L2/L3)로만 결정했으나, USA가 L2로 분류되면서도 실제 서류는 COA가 아닌 어획증명서를 사용한다는 사실이 DESIGN.md v6 검토에서 확인됨. `listGrade`와 서류 체계가 항상 1:1 대응하지 않음.

**결정**: `Verdict` 인터페이스에 `documentTrack: "catch_certificate" | "coa"` 필드를 신설하고, 서류 결정은 `listGrade`가 아닌 `documentTrack`으로 수행.

매핑 규칙:
- `listGrade: "L1"` (USA 포함) → `documentTrack: "catch_certificate"`
- `listGrade: "L2"` → `documentTrack: "coa"`
- `listGrade: "L3"` + `fisheryExemption: true` → `documentTrack: "coa"` (L3 전용 서류 3건)

**근거**:
- DESIGN.md §6.1 "listGrade와 documentTrack은 독립이다" 명시.
- 필드 분리 없이 UI에서 등급으로 서류를 결정하면, USA 같은 예외 케이스에서 잘못된 서류 안내를 제공하는 버그가 발생.
- `DocumentTrack`을 1급 타입으로 만들면 엔진 테스트에서 서류 트랙을 명시적으로 검증 가능.

**결과**: `engine/types.ts` `DocumentTrack` 타입 추가. `rules/required-docs.ts` 트랙 기반 상수(`CATCH_CERT_DOCS`, `COA_STANDARD_DOCS`, `COA_L3_EXEMPTION_DOCS`)로 재구조화. `engine/documents.ts` 시그니처 `getCoaRequiredDocs(track, l3Exemption?)`. `ImportStep.tsx`에 트랙 배지 노출. `UploadStep.tsx`에 트랙 표시.

---

## ADR-003: L3 국가 판정 — 기본 ineligible, fisheryExemption 입증 분기

**날짜**: 2026-05-15
**상태**: 확정

**맥락**: DESIGN.md v6 이전 구현에서 L3 국가(중국, 베트남, 인도, 방글라데시)도 품목·가공국 조건만 충족하면 `eligible`로 판정했음. 그러나 MMPA(Marine Mammal Protection Act) 규정상 L3 지정국은 수입 원칙 금지 대상이며, 미적용 어업 입증 시에만 예외적으로 허용.

**결정**:
- L3 + 전 필드 입력 + `fisheryExemption` 미제공 또는 `false` → `ineligible` (원칙 수입 금지 메시지)
- L3 + 전 필드 입력 + `fisheryExemption: true` → `eligible` + `documentTrack: "coa"` + 전용 서류 3건(COA, 미적용 어업 입증서, 항구 심사 동의서)

**근거**:
- DESIGN.md §8.2 "L3 + fisheryExemption 미입력/false → ineligible (원칙 수입 금지)" 명시.
- "오류를 보여주는 시스템이 아닌 오류 상태에 진입하지 못하게 하는 시스템"(§4): `fisheryExemption` 없이는 다음 버튼 자체가 잠겨야 함.
- `fisheryExemption`을 `conditional`의 `missing` 항목으로 넣지 않은 이유: 이 값은 boolean 체크박스이며 "미입력"이 아닌 "미동의"로 해석되므로 `ineligible`이 의미론적으로 정확.

**결과**: `engine/coa.ts` L3 분기 추가. `ImportStep.tsx`에 L3 경고 배너 + 체크박스 UI 추가. API 스키마에 `fisheryExemption: z.boolean().optional()` 추가. 테스트 픽스처 COA-009~012에 `fisheryExemption: true` 추가, COA-027 L3 미체크 → ineligible 케이스로 교체.

---

## ADR-004: 룰셋 유효 기간 모델링 — effectiveFrom/effectiveTo를 1급으로

**날짜**: 2026-05-15
**상태**: 확정

**맥락**: 수산물 수출 규정은 주기적으로 개정되며, 국가 등급과 어업 가능 조합이 변경됨. 단순히 현재 유효한 규칙만 저장하면 시간 의존성 테스트와 룰셋 갱신 이력 추적이 불가.

**결정**: 모든 룰셋 항목에 `effectiveFrom: string` (YYYY-MM-DD)과 `effectiveTo: string | null`을 필수 필드로 포함. 엔진 함수는 `asOf: Date = new Date()` 파라미터로 판정 기준일을 외부 주입 받음.

판정 로직:
- `asOf < effectiveFrom` → `unknown` (미발효)
- `effectiveTo !== null && asOf > effectiveTo` → `unknown` (만료)
- 범위 내 → 정상 판정 진행

**근거**:
- 시간 의존성을 외부에서 주입해야 `new Date(asOf)`로 과거·미래 날짜 테스트 가능.
- `unknown` 반환으로 "수동 검토 안내"를 강제해 오판 방지.
- 룰셋 현황 디버그 뷰에서 날짜 시뮬레이터로 특정 시점의 활성 규칙을 시각화 가능.

**결과**: `LOFF_RULESET` 20건, `COA_COUNTRY_LIST` 20건 모두 `effectiveFrom/To` 포함. 만료 시나리오 테스트(DOM-028~030, COA-028~030) 통과. 룰셋 현황 페이지 날짜 시뮬레이터로 D4 데모 가능.
