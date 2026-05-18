`tests/fixtures/` 의 JSON fixture를 live API(localhost:8787)에 실행하고 pass/fail을 보고합니다.

## 준비

1. `tests/fixtures/` 디렉터리의 모든 `.json` 파일을 읽습니다.
2. 파일이 없으면 "fixture 없음 — `tests/fixtures/DOM-001.json` 형식으로 추가하세요"를 출력하고 종료합니다.

## fixture 형식 (docs/TEST_DATA.md §6 기준)

```json
{
  "id": "DOM-001",
  "description": "설명",
  "input": { ... },
  "asOf": "YYYY-MM-DD",
  "expectedVerdict": { "kind": "eligible", ... },
  "expectedMessage": "..."
}
```

- `id`가 `DOM-`으로 시작하면 → `POST http://localhost:8787/api/verify/domestic`
- `id`가 `COA-`으로 시작하면 → `POST http://localhost:8787/api/verify/coa`
- 그 외 prefix는 건너뛰고 "알 수 없는 prefix" 경고 출력

## 요청 본문

```json
{ ...input, "asOf": "<fixture의 asOf>" }
```

## 검증 규칙

각 fixture에 대해 다음을 순서대로 검사합니다.

1. **HTTP 상태** — 200이 아니면 즉시 FAIL (서버 미응답 여부 포함)
2. **kind 일치** — `response.kind === expectedVerdict.kind`
3. **nextStepEnabled 일치** — `response.nextStepEnabled === expectedVerdict.nextStepEnabled`
4. **선택 필드 일치** (expectedVerdict에 있는 경우만):
   - `loffId`, `matchedRuleId`, `listGrade`, `documentTrack`
5. **expectedMessage** (fixture에 있는 경우만) — `response.message`에 포함 여부(`includes`)

## 출력 형식

각 fixture 결과를 한 줄로:
```
✅ DOM-001  eligible / nextStep=true  (나잠 + 전복 + 남해 → 유효)
❌ DOM-007  kind: expected=ineligible, got=eligible  (어법-어종 불가 케이스)
⚠️  COA-003  서버 미응답 (localhost:8787 연결 실패)
```

마지막에 요약:
```
결과: 28 pass / 2 fail / 0 skip  (총 30건)
```

fail이 있으면 각 fail 항목의 fixture id, 기대값, 실제값을 상세 출력합니다.

## 주의

- `asOf`는 fixture에서 명시한 값을 사용합니다. `new Date()` 의존 금지.
- API 서버가 응답하지 않으면 전체 중단 없이 해당 항목만 ⚠️ skip으로 처리합니다.
- fixture 파일 파싱 오류(잘못된 JSON)는 FAIL로 집계합니다.
