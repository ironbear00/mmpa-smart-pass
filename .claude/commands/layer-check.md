CLAUDE.md 레이어 규칙에 따라 `src/` 전체를 정적 분석합니다.

## 검사 항목

### 1. `src/rules/` — TS 상수만 허용
- 함수 선언(`function`, 화살표 함수 `=>`가 포함된 `const`) 존재 여부
- `export const` 이외의 내보내기 존재 여부
- `as const satisfies` 패턴 누락 여부

### 2. `src/engine/` — 순수 함수만 허용
- `better-sqlite3`, `hono`, `fetch`, `http`, `fs`, `path` 등 I/O import 존재 여부
- `src/api/` import 존재 여부
- 함수 파라미터에 `asOf: Date` 누락 여부
- `new Date()` 하드코딩 (파라미터 없이 직접 사용) 존재 여부

### 3. `src/ui/` — HTTP(`/api/*`)만 허용
- `src/engine/` 직접 import 존재 여부
- `src/api/` 직접 import 존재 여부

### 4. `src/contracts/` — 타입만 허용
- 함수 존재 여부

## 결과 형식
각 위반 항목을 `파일경로:라인번호 — 위반 내용` 형식으로 나열하세요.
위반이 없으면 "레이어 규칙 이상 없음"으로 보고합니다.
