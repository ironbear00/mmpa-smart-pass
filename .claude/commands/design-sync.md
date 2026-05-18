설계 문서와 현재 코드 구현 상태를 비교해 불일치 항목을 보고합니다.

## 읽어야 할 문서

1. `MMPA_SmartPass.md` — 전체 설계 (단일 진실 공급원)
2. `docs/DB.md` — DB 스키마 설계
3. `docs/TEST_DATA.md` — 테스트 데이터 가이드
4. `docs/DECISIONS.md` — 의사결정 기록 (있을 경우)

## 읽어야 할 코드

- `src/engine/types.ts` — Verdict, 도메인 타입
- `src/rules/` 전체 — 룰셋 상수
- `src/engine/` 전체 — 비즈니스 로직
- `src/contracts/` 전체 — API 계약
- `src/api/db.ts` — DB 스키마 구현

## 비교 항목

1. 설계 문서에 정의된 Verdict 종류와 `types.ts` 구현이 일치하는가?
2. `docs/DB.md` 테이블 정의와 `src/api/db.ts` CREATE TABLE이 일치하는가?
3. 설계 문서의 룰셋 목록과 `src/rules/` 파일이 일치하는가?
4. 설계 문서의 API 엔드포인트와 `src/contracts/` 타입이 일치하는가?

## 결과 형식

불일치 항목을 다음 형식으로 나열합니다:
- **항목**: [설계 문서 내용] vs [현재 코드 상태]
- **권장**: 문서 업데이트 또는 코드 수정 중 어느 쪽이 진실인지 제안

불일치가 없으면 "설계 문서와 코드 동기화 이상 없음"으로 보고합니다.
