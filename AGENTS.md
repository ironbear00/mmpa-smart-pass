# MMPA Smart-Pass — Agent 규칙

## 스택 주의
이 프로젝트는 **Vite + React 18 + Hono** 스택입니다.
Next.js, App Router, Pages Router, Server Actions 패턴은 사용하지 않습니다.

## 작업 전 체크리스트
- [ ] 레이어 규칙 준수: rules/=상수만, engine/=순수함수, api/=I/O, ui/=HTTP만
- [ ] 룰셋 상수에 `as const satisfies` 적용됐는지
- [ ] 엔진 함수에 `asOf: Date` 파라미터 있는지
- [ ] 결과가 `Verdict` 타입으로 수렴하는지
- [ ] 1 파일 1 책임, LOC 제한 (UI 150 / 룰셋 200) 준수

## 금지 패턴
- `src/rules/`에 함수 작성 → `src/engine/`으로 이동
- `src/engine/`에서 DB/네트워크 접근
- `src/ui/`에서 `engine/` 또는 `api/` 직접 import
- ORM 사용 (Prisma, Drizzle 등)
- 커스텀 CSS (Shadcn 토큰만 허용)
- `new Date()` 하드코딩 (반드시 `asOf` 파라미터로 주입)