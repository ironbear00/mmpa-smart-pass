TypeScript 타입 검사를 실행하고 오류를 보고합니다.

## 실행

```
pnpm typecheck
```

`package.json`에 `typecheck` 스크립트가 없으면 `pnpm tsc --noEmit`을 대신 실행합니다.

## 출력 형식

오류가 있는 경우, 각 오류를 한 줄로 나열합니다:

```
파일경로:라인번호 — TS{코드}: 오류 메시지
```

예:
```
src/engine/coa.ts:81 — TS2345: Argument of type 'string[]' is not assignable to parameter of type 'readonly string[]'
src/ui/App.tsx:14 — TS2304: Cannot find name 'WizardStep'
```

오류가 없는 경우:
```
타입 오류 없음 (N개 파일 검사 완료)
```

## 요약

오류가 있으면 마지막에:
```
총 N개 오류 — 레이어별: engine/ M건, ui/ K건, rules/ J건
```

## 주의

- tsc 원문 출력을 그대로 붙여넣지 않습니다. 위 형식으로 가공해서 보고합니다.
- 동일 파일에 여러 오류가 있으면 파일 단위로 묶어서 출력합니다.
- `skipLibCheck` 등 컴파일러 옵션 관련 노이즈는 제외합니다.
