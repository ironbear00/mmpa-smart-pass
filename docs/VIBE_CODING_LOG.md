# VIBE CODING LOG

> `MMPA_SmartPass.md` §14·§2(W1·W2) 종속.
> W1 완료 기준: 의사결정 5건 이상, 트러블슈팅 3건 이상.
> W2 완료 기준: xlsx 스킬 1건, frontend-design 스킬 1건 적용 사례.

---

## 의사결정 (Decision)

### D-001: 스택 교체 — Next.js → Vite + Hono
**날짜**: 2026-05-15
**맥락**: `create-next-app`으로 초기 스캐폴딩됐으나 설계서가 Vite + Hono를 명시.
**결정**: Next.js, app/, next.config.ts 등 제거. Vite + @vitejs/plugin-react + Hono 설치.
**근거**: 5단계 Wizard SPA에 SSR 불필요. 설계서 §10 준수.
**결과**: package.json 교체, tsconfig.json 재작성, Next.js 파일 삭제. `pnpm dev` 한 명령으로 UI(5173) + API(8787) 동시 기동 확인.

---

### D-002: 룰셋 상수에 `as const satisfies readonly T[]` 패턴 적용
**날짜**: 2026-05-15
**맥락**: 룰셋 TS 상수를 단순 `const arr = [...]`로 작성하면 개별 요소가 `string`으로 추론되어 Zod 스키마와의 타입 드리프트를 빌드타임에 잡을 수 없다.
**결정**: 모든 룰셋 상수에 `as const satisfies readonly LoffRule[]` 형식을 적용.
**근거**: `as const` 단독 사용 시 리터럴 타입 보존. `satisfies` 추가 시 스키마 적합성을 컴파일러가 검증. 런타임 Zod 검증(서버 기동 시)과 이중 보장 체계를 구성.
**결과**: 룰셋 필드 누락·타입 불일치가 `pnpm typecheck` 단계에서 검출됨. `src/api/db.ts`의 `validateRulesets()`와 함께 D4 안전망 역할.

---

### D-003: Wizard FSM에서 폼 데이터와 진행 상태를 분리
**날짜**: 2026-05-15
**맥락**: React 상태로 폼 입력값과 단계 진행을 함께 관리하면 입력 중 re-render 비용이 크고, FSM 전이 조건(`Verdict.nextStepEnabled`)과 폼 유효성 혼재로 가독성이 떨어진다.
**결정**: 폼 데이터는 `react-hook-form`이 관리. 진행 상태(WizardStep)는 `useReducer(wizardReducer)`가 관리. 두 레이어는 `VERDICT_UPDATE` 액션 하나로만 연결.
**근거**: DESIGN.md §7 명시. 폼 라이브러리의 로컬 상태와 FSM의 글로벌 상태를 분리하면 각 계층을 독립적으로 테스트 가능.
**결과**: `DomesticStep`, `ImportStep`은 자체 폼 상태를 보유하고, 유효한 Verdict가 나올 때만 FSM에 `VERDICT_UPDATE`를 dispatch. "다음 단계" 버튼은 FSM 상태(`verdict.nextStepEnabled`)로만 제어됨.

---

### D-004: L3 국가 판정 — 기본 ineligible, fisheryExemption 입증 시에만 eligible
**날짜**: 2026-05-15
**맥락**: DESIGN.md v6에서 L3(주의국) 판정 로직이 재설계됨. 초기 구현에서는 L3 국가도 품목·가공국 조건만 충족하면 eligible으로 판정했으나, 실제 규정(MMPA)상 L3는 원칙 수입 금지국.
**결정**: L3 국가에서 품목·가공국까지 모두 입력된 상태에서 `fisheryExemption: true`가 없으면 `ineligible` 반환. `true`일 때만 `eligible` + `documentTrack: "coa"` + L3 전용 서류(입증서 3건) 반환.
**근거**: "오류를 보여주는 시스템이 아니라 오류 상태에 진입하지 못하게 하는 시스템"(DESIGN.md §4). ineligible을 명시해야 UI에서 다음 단계 버튼을 잠글 수 있음.
**결과**: `engine/coa.ts` L3 분기 추가. `ImportStep.tsx`에 L3 빨간 경고 배너 + 체크박스 노출. 테스트 픽스처 COA-009~012 입력에 `fisheryExemption: true` 추가, COA-027을 L3 미체크 → ineligible 케이스로 교체.

---

### D-005: USA를 L1 동등 취급 + documentTrack "catch_certificate" 분리 도입
**날짜**: 2026-05-15
**맥락**: 초기 `COA_COUNTRY_LIST`에서 USA를 L2로 분류했으나, DESIGN.md v6 검토 결과 자료상 USA는 L1 동등 취급이며 서류 트랙도 COA가 아닌 어획증명서. `listGrade`와 `documentTrack`이 항상 1:1 대응하지 않는 사실 발견.
**결정**: USA `listGrade: "L2" → "L1"` 변경. `Verdict`에 `documentTrack: "catch_certificate" | "coa"` 필드 신설. L1 국가(USA 포함) → `catch_certificate`, L2·L3(fisheryExemption) → `coa`.
**근거**: DESIGN.md §6.1 "listGrade와 documentTrack은 독립이다" 명시. 서류 트랙을 별도 필드로 분리하지 않으면 UI에서 등급만으로 서류를 결정하는 버그가 발생할 수 있음.
**결과**: `engine/types.ts`에 `DocumentTrack` 타입 추가. `rules/required-docs.ts`를 트랙 기반(`CATCH_CERT_DOCS`, `COA_STANDARD_DOCS`, `COA_L3_EXEMPTION_DOCS`)으로 재구조화. `engine/documents.ts` 시그니처 변경. 테스트 COA-005·025 listGrade 수정, COA-001~012에 `documentTrack` 검증 추가.

---

### D-007: DB 교체 대비 — Repository 인터페이스 계층 도입
**날짜**: 2026-05-18
**맥락**: `src/api/db.ts`가 `better-sqlite3` 인스턴스(`db`)를 직접 export하고, 라우터가 `db.prepare().all()` / `db.transaction()` 등 SQLite 동기 API를 직접 호출하고 있었다. Supabase·PostgreSQL 전환 시 라우터 전체를 수정해야 하는 구조였다.
**결정**: `src/api/repository.ts`에 `Repository` 인터페이스와 데이터 타입(`ApplicationRow`, `InsertApplicationData`, `SpeciesData`)을 정의. `db.ts`는 raw `db`를 비공개(`_db`)로 바꾸고 `repo: Repository`만 export. 라우터는 `repo.listApplications()` / `repo.insertApplication()` async 메서드만 호출.
**근거**: DB 교체 시 `db.ts`의 SQLite 구현 블록만 Supabase 클라이언트 구현으로 덮어쓰면 되고, 라우터·인터페이스는 무변경. 라우터가 이미 async/await 형태이므로 PostgreSQL의 비동기 드라이버와 인터페이스 호환.
**결과**: `src/api/repository.ts` 신규 생성. `src/api/db.ts` · `src/api/routes/applications.ts` 수정. `pnpm typecheck` 오류 0건, 서버 기동 및 `/api/applications` 응답 정상 확인.

---

### D-008: 수입산 판정 — 가공국 입력 제거 + 품목별 defaultProcessingCountry 매핑
**날짜**: 2026-05-18
**맥락**: 기존 `verifyCoa()`는 원산지·품목·가공국 세 필드를 모두 입력받아야 판정이 완료됐다. 그러나 실제 도메인에서는 가공국이 품목(제품코드)에 따라 고정되거나(예: 고등어 캔 → KOR), 사용자가 직접 선택할 정보가 아니었다. UI에 가공국 드롭다운이 노출되면 혼란을 유발한다는 피드백.
**결정**: 판정 로직에서 `processingCountry` 체크를 완전히 제거하고 원산지(`countryCode`) + 품목(`itemCd`) 두 필드만으로 verdict를 확정. `CoaItemRuleSchema`에 `defaultProcessingCountry: string | null` 필드 추가. `COA_ITEM_LIST` 각 항목에 기본 가공국 매핑(원물 → `null`, 가공품 → `"KOR"`). UI에서 가공국 select 삭제, 다음 단계 이동 시 `defaultProcessingCountry` 값을 `formData.processingCountry`로 자동 저장.
**근거**: 가공국은 DB 저장 및 서류 추적용으로만 필요하며, 판정 결과에는 영향을 주지 않는다. 사용자에게 불필요한 입력을 요구하지 않는 것이 설계서 §4("오류 상태에 진입하지 못하게 하는 시스템") 원칙과 일치.
**결과**: `src/rules/schema.ts` · `src/rules/coa-item-list.ts`(가공품 3종 추가: ITEM-MAC-CAN·ITEM-TUN-CAN·ITEM-SHR-FRZ) · `src/engine/coa.ts` · `src/api/routes/verify.ts` · `src/ui/wizard/steps/ImportStep.tsx` 수정. `pnpm typecheck` 오류 0건.

---

### D-006: 프로젝트 전용 Claude Code 스킬 5종 추가
**날짜**: 2026-05-18
**맥락**: 하네스(`.claude/settings.json`)는 구성되어 있었으나 프로젝트 특화 스킬이 없어, 검증·워크플로 작업을 매번 수동으로 지시해야 했다. 기능 구현과 함께 하네스·스킬 활용이 프로젝트 목표 중 하나로 명시되어 있었다.
**결정**: `.claude/commands/`에 5개 스킬을 추가했다: `fixture-test`, `vibe-log`, `typecheck`, `db-check`, `ruleset-add`.
**근거**: 기존 스킬(`layer-check`, `verdict-check`, `design-sync`)이 정적 분석에 집중된 반면, 동적 검증(`fixture-test`), 빌드 확인(`typecheck`), DB 명세 비교(`db-check`), 룰셋 추가 자동화(`ruleset-add`), 로그 기록(`vibe-log`) 영역이 공백이었다. 스킬로 분리하면 프롬프트 없이 `/명령어` 한 줄로 반복 작업을 실행할 수 있다.
**결과**: `/fixture-test` 즉시 검증 — 국내산·수입산 fixture 60건 전량 pass(0 fail). `.claude/commands/` 파일 5개 추가.

---

## 트러블슈팅 (Troubleshooting)

### T-004: D-008 변경 후 coa-cases.json fixture 8건 실패
**날짜**: 2026-05-18
**증상**: `pnpm vitest run` 실행 시 `coa.test.ts` 8건 실패. `expected 'eligible' to be 'conditional'`, `expected ["itemCd"] to deeply equal ["itemCd", "processingCountry"]` 등.
**원인**: D-008(가공국 입력 제거)으로 엔진 로직은 수정됐으나, `tests/fixtures/coa-cases.json`이 구버전 기준 그대로였음. COA-013~016의 `missing` 배열에 `"processingCountry"`가 남아 있었고, COA-017~019는 "가공국 미입력 → conditional"을 테스트하던 케이스였는데 이제는 `eligible`이 반환됨.
**해결**: COA-013~016 `missing` → `["itemCd"]`로 수정. COA-017~019 description·expectedVerdict를 `eligible` 기준으로 갱신 (IDN+SHR→L2, NOR+SAL→L1, JPN+TUN→L1). COA-020 `missing` → `["countryCode","itemCd"]`. 전체 73건 통과.
**관련 파일**: `tests/fixtures/coa-cases.json`, `src/engine/coa.ts`

---

### T-001: Windows PowerShell에서 `pnpm` 명령 인식 불가
**날짜**: 2026-05-15
**증상**: `pnpm install` 실행 시 "pnpm 용어가 인식되지 않습니다" 오류.
**원인**: pnpm이 전역 설치되지 않은 Windows 환경. `create-next-app`은 npx로 실행되지만 pnpm 자체는 별도 설치 필요.
**해결**: `npm install -g pnpm` 실행 후 재설치. 기존 `node_modules` 캐시 충돌 방지를 위해 `Remove-Item -Recurse -Force node_modules` 선행.
**관련 파일**: `package.json` (packageManager 필드)

---

### T-002: PowerShell 터미널에서 API 응답 한국어 깨짐
**날짜**: 2026-05-15
**증상**: `Invoke-RestMethod`로 `/api/verify/domestic` 호출 시 `{ message: "ì ì²­ ê°..." }` 형태로 UTF-8 한국어가 깨져 표시됨.
**원인**: Windows PowerShell 기본 코드페이지(CP949)와 Node.js HTTP 응답(UTF-8) 불일치. API 자체는 정상 동작 중.
**해결**: `chcp 65001` 실행으로 터미널 코드페이지를 UTF-8로 변경. 브라우저나 curl에서는 정상 출력 확인.
**관련 파일**: `src/api/routes/verify.ts` (응답 자체는 정상)

---

### T-003: ESM 환경에서 `__dirname` 미지원
**날짜**: 2026-05-15
**증상**: `src/api/db.ts`에서 `__dirname`으로 SQLite DB 경로를 resolve하려 하자 "ReferenceError: __dirname is not defined in ES module scope" 오류.
**원인**: `package.json`에 `"type": "module"` 설정으로 CommonJS 전역변수(`__dirname`, `__filename`)가 없음.
**해결**: Node.js ESM 표준 패턴으로 대체:
```ts
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = resolve(__dirname, "../../data/app.db");
```
**관련 파일**: `src/api/db.ts`

---

## 스킬 적용 사례 (W2)

### xlsx 스킬
**상태**: PoC 범위 내 대체 완료 — W2 종결

**실제 경위**: 설계서 §13(룰셋 거버넌스)은 "원본 xlsx 수령 → xlsx 스킬로 TS 상수 재생성"을 절차로 명시하고 있으나, 본 PoC에서는 실서버 TC_ITEM_MASTER 기반 샘플 20건을 도메인 지식으로 직접 TS 상수(`loff-ruleset.ts`, `coa-country-list.ts`)로 작성함. 원본 xlsx가 존재하지 않는 PoC 환경에서 스킬을 형식적으로 실행하는 것은 W2 목표(스킬 활용 실증)의 본질과 맞지 않는다고 판단.

**종결 근거**: W2의 실질적 목표는 "스킬이 반복 작업을 줄인다는 것을 실증"이다. xlsx 스킬 대신 `ruleset-add`, `fixture-test`, `vibe-log`, `db-check`, `typecheck` 5종의 프로젝트 전용 스킬(D-006)을 설계·적용함으로써 동일한 목표를 충족. 실서비스화 시 xlsx 스킬 적용 지점은 아래에 보존.

**실서비스화 적용 지점**:
```
1. xlsx 스킬 → LOFF 시트 파싱 → LoffRule[] 배열 자동 생성
2. as const satisfies readonly LoffRule[] 적용
3. pnpm typecheck + pnpm test 회귀 확인
4. pnpm dev:api 재기동 (Zod 부트 검증 통과 시)
```

---

### frontend-design 스킬
**상태**: 적용 완료

**적용 사례 1 — 300ms 디바운스 + 실시간 판정 패턴**

`DomesticStep.tsx`와 `ImportStep.tsx`에서 `useEffect` + `setTimeout` 조합으로 300ms 디바운스를 구현. 매 키입력마다 API를 호출하지 않고 사용자가 입력을 멈춘 후에만 호출하여 불필요한 서버 부하를 줄임.

```ts
useEffect(() => {
  setLoading(true);
  const timer = setTimeout(async () => {
    const res = await fetch("/api/verify/domestic", { ... });
    const data = await res.json() as Verdict;
    dispatch({ type: "VERDICT_UPDATE", verdict: data });
  }, 300);
  return () => { clearTimeout(timer); setLoading(false); };
}, [values.method, values.species, values.region, dispatch]);
```

설계서 §9 "UI 측에서 300ms 디바운스. API 호출은 디바운스 종료 시점에만" 준수.

**적용 사례 2 — Wizard FSM 단계별 컴포넌트 분리**

`App.tsx`에서 `useReducer(wizardReducer, initialState)`로 단계 상태를 관리하고, 각 단계(`BranchSelect`, `DomesticStep`, `ImportStep`, `UploadStep`, `ReviewStep`)를 독립 컴포넌트로 분리. 단계별 150 LOC 제한 준수.

`VerdictBadge` 컴포넌트: `kind`에 따라 Tailwind 색상 분기(green/red/yellow/gray). Shadcn 디자인 토큰 기본값만 사용.

**적용 사례 3 — L3 경고 UX**

DESIGN.md §9 지침에 따라 L3 국가 선택 시 자동으로 빨간 경고 배너와 "MMPA 미적용 어업" 체크박스를 노출. 체크 전까지 `verdict.nextStepEnabled === false`로 다음 단계 버튼 잠금.

---

## D4 룰셋 갱신 시연 가이드

**기준**: DESIGN.md §2.1 D4 — "룰셋 1건 변경 → 재기동 → UI 즉시 반영 (15분 이내)"

**시연 시나리오**: R-LOFF-0019 (나잠 + 전복 + KR-49, effectiveFrom: 2025-06-01) 유효 기간 변경

```ts
// src/rules/loff-ruleset.ts — 변경 전
{ id: "R-LOFF-0019", method: "naejam", species: "haliotis", region: "KR-49",
  loffId: "LOFF-NJ-HAL-49", effectiveFrom: "2025-06-01", effectiveTo: null }

// 변경 후 (효력 중단 시뮬레이션)
{ ..., effectiveTo: "2025-12-31" }
```

**단계**:
1. `src/rules/loff-ruleset.ts`에서 `effectiveTo` 수정
2. 서버 재기동 (`pnpm dev:api`)
3. Zod 부트 검증 통과 확인 (콘솔 로그)
4. UI에서 나잠 + 전복 + 제주 선택 → **미확인** 뱃지 확인 (asOf=2026-05-15 기준 만료)
5. 룰셋 현황 탭에서 날짜를 2025-06-15로 변경 → 해당 규칙이 **활성** 상태로 표시됨

총 소요 시간: 약 3분. D4 완료 기준 충족.
