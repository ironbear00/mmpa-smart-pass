# DB 설계 (PoC)

> `DESIGN.md` §6.4·§10·§11 종속. 마스터 데이터는 TS 상수, 신청 이력만 SQLite.

---

## 1. 실서버 → PoC 매핑

| 실서버 테이블 | 역할 | PoC 위치 |
|---|---|---|
| `TN_MMPA_MASTER` | 신청서 헤더 | SQLite `applications` |
| `TN_MMPA_CA_SPECIES` | 신청서 어종 라인 | SQLite `application_species` |
| `TN_CA_LOFF_INFO` + `TN_CA_LOFF_SPECIES` | LOFF 마스터 (국내산) | `src/rules/loff-ruleset.ts` |
| `TC_ITEM_MASTER` | 품목 마스터 (수입산) | `src/rules/coa-item-list.ts` |

마스터를 DB가 아닌 TS 상수로 두는 이유: `as const satisfies` 빌드타임 보장, D4(룰셋 변경 → 재기동) 시연 흐름 유지, ORM 부채 회피.

---

## 2. 컬럼 압축 원칙

실서버 컬럼 중 다음은 PoC에서 **모두 제거**한다.

- 공통코드 컬럼 (`FISHERY_CD`, `CERTIFICATE_CD`, `STATUS_CD`, `SUPPORT_CD`, `PRDT_SPECIES_CD` 등) — 공통코드 체계 자체를 들고오지 않음
- 외부 시스템 연동 컬럼 (`INPBNO`, `APPR_NO`, `APPR_STATUS`, `RCPT_*`) — PoC 범위 밖
- 발급·출력 카운트 (`ISSUE_CNT`, `PRINT_CNT`) — PoC 범위 밖
- 다국어 표기 (`MASTER_NM_ENG`, `ITEM_NM_JPN` 등) — 한국어 UI만
- soft delete·감사 일부 (`USE_YN`, `REG_ID`, `UPD_ID`) — 단일 사용자
- 전송·동기화 플래그 (`TRAN_DT`, `TRAN_FLAG`, `SCE_SYS_CD`, `GOODCODE_SCE_YN` 등) — 외부 연동 없음

남기는 것: 도메인 식별자, 핵심 속성, 최소 감사(`REG_DT`/`UPD_DT`).

---

## 3. `applications`

`TN_MMPA_MASTER`에서 위 원칙으로 압축. 새로 추가하는 컬럼은 `verdict_snapshot` 하나.

| 컬럼 | 타입 | 출처 / 비고 |
|---|---|---|
| `id` | INTEGER PK | `MMPA_MASTER_ID` |
| `doc_no` | TEXT UNIQUE | `DOC_NO`. `MMPA-YYYY-{seq}` 형식 |
| `origin_type` | TEXT CHECK | `ORIGIN_TYPE` ('1'/'2' → 'domestic'/'import') |
| `applicant_nm` | TEXT | `APPLCNT_PNM` |
| `applicant_dt` | TEXT | `APPLCNT_DT` |
| `status` | TEXT CHECK | `STATUS_CD` (공통코드 → 'draft'/'submitted'/'rejected' 3종 축소) |
| `rejection_reason` | TEXT NULL | `REJECTION_REASON` |
| `verdict_snapshot` | TEXT (JSON) | **신규.** 제출 시점 `Verdict` JSON 보존. 룰셋 갱신 후에도 당시 판정 재현용 |
| `reg_dt`, `upd_dt` | TEXT | 감사 최소선 |

`verdict_snapshot`이 본 PoC의 차별점이다. 실서버는 별도 이력 테이블로 처리하나, PoC는 JSON 컬럼 한 줄로 갈음한다.

---

## 4. `application_species`

`TN_MMPA_CA_SPECIES`에서 압축. **국내산·수입산 컬럼이 한 테이블에 공존**하되, `origin_type`에 따라 NULL 허용이 달라진다.

### 4.1 공통 컬럼

| 컬럼 | 출처 |
|---|---|
| `id`, `application_id`, `seq` | PK·FK·라인 번호 |
| `species_kor_nm`, `species_eng_nm`, `species_sci_nm` | `PRDT_SPECIES_KOR_NM`, `PRDT_SPECIES_ENG_NM`, (학명은 실서버 `TC_ITEM_MASTER.SCIENTIFIC_NM_ENG`에서 복사) |
| `prdt_form`, `prdt_weight_kg` | `PRDT_FORM`, `PRDT_WEIGHT` |
| `hts_number` | `HTS_NUMBER` |

### 4.2 국내산 전용

| 컬럼 | 출처 |
|---|---|
| `loff_id` | `LOFF_ID` |

`EQUAL_LOFF_ID_LIST`는 **삭제**. PoC는 단일 LOFF 매칭만.

### 4.3 수입산 전용

| 컬럼 | 출처 |
|---|---|
| `item_cd` | `TC_ITEM_MASTER.ITEM_CD` 참조 |
| `country_origin`, `country_process` | 실서버는 별도 컬럼, ISO 3166-1 alpha-3로 통일 |
| `fishing_gear` | `FISHING_GEAR` (+ `FISHING_GEAR_DES` 통합) |
| `vessel_flag`, `vessel_name`, `vessel_no` | `VSSL_FLAG`, `VSSL_NAME`, `VSSL_NO` |

### 4.4 제약 관리

`origin_type`에 따른 NULL 분기는 DB CHECK이 아니라 **엔진(`src/engine/`)에서 검증**한다. DB 제약은 무결성의 마지막 그물이지 1차 검증선이 아니다.

---

## 5. 인덱스

- `applications(origin_type)`, `applications(status)` — 이력 조회용
- `application_species(application_id)` — JOIN
- `application_species(loff_id)`, `application_species(item_cd)` — 룰셋 역추적용

---

## 6. 초기화·시드 절차

```
pnpm dev 시 자동:
  1. CREATE TABLE IF NOT EXISTS (db.ts 부팅)
  2. 룰셋 Zod 검증 (실패 시 서버 기동 거부)

수동:
  pnpm seed  # scripts/seed.ts. 신청 이력 시드만. 룰셋은 import.
```

---

## 7. 트러블슈팅 슬롯 (사전 예측)

| 예상 포인트 | 확인 시점 |
|---|---|
| `better-sqlite3` 네이티브 빌드 실패 | `pnpm install` |
| `verdict_snapshot` JSON 파싱 실패 | 조회 시 |
| `doc_no` 채번 충돌 | 동시 제출 (PoC는 단일 사용자, 미해결 채택) |

---

**문서 버전**: v1 / **상태**: 확정. 변경은 `DECISIONS.md` ADR로.
