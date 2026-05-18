`src/engine/` 의 모든 함수가 `Verdict` 타입 규칙을 준수하는지 검사합니다.

## 기준 (`src/engine/types.ts` 기준)

`Verdict` 타입은 다음 4가지 중 하나여야 합니다:
- `eligible` — 조합 확정, `nextStepEnabled: true`
- `ineligible` — 룰셋 없음, 한국어 `reason` 필수
- `conditional` — 입력 부분, `missing[]` 필수
- `unknown` — 수동 검토 안내

## 검사 항목

1. `src/engine/types.ts` 에서 `Verdict` 타입 정의를 읽어 기준을 파악합니다.
2. `src/engine/` 의 모든 `.ts` 파일을 읽습니다.
3. 각 export 함수의 반환 타입이 `Verdict` (또는 `Verdict[]`, `Promise<Verdict>`)인지 확인합니다.
4. `ineligible` 반환 시 `reason` 문자열이 한국어인지 확인합니다.
5. `asOf: Date` 파라미터가 있는지 확인합니다.

## 결과 형식
위반 항목을 `파일경로:라인번호 — 위반 내용`으로 나열합니다.
이상 없으면 "Verdict 타입 규칙 이상 없음"으로 보고합니다.
