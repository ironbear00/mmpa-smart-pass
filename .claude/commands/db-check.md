`src/api/db.ts`의 실제 CREATE TABLE / CREATE INDEX 구문과 `docs/DB.md`의 명세를 비교해 불일치를 보고합니다.

## 읽어야 할 파일

1. `docs/DB.md` — 설계 명세 (§3 applications, §4 application_species, §5 인덱스)
2. `src/api/db.ts` — 실제 SQL 구현

## 비교 항목

### applications 테이블 (docs/DB.md §3)

| 검사 | 기준 |
|------|------|
| 컬럼 목록 | `id`, `doc_no`, `origin_type`, `applicant_nm`, `applicant_dt`, `status`, `rejection_reason`, `verdict_snapshot`, `reg_dt`, `upd_dt` 모두 존재하는지 |
| `doc_no` | `UNIQUE NOT NULL` 제약 있는지 |
| `origin_type` | `CHECK(origin_type IN ('domestic', 'import'))` 있는지 |
| `status` | `CHECK(status IN ('draft', 'submitted', 'rejected'))` 있는지 |
| `rejection_reason` | NULL 허용인지 |
| `verdict_snapshot` | `NOT NULL` 인지 |
| `reg_dt`, `upd_dt` | `DEFAULT (strftime(...))` 있는지 |

### application_species 테이블 (docs/DB.md §4)

| 검사 | 기준 |
|------|------|
| 공통 컬럼 | `id`, `application_id`, `seq`, `species_kor_nm`, `species_eng_nm`, `species_sci_nm`, `prdt_form`, `prdt_weight_kg`, `hts_number` |
| 국내산 전용 | `loff_id` |
| 수입산 전용 | `item_cd`, `country_origin`, `country_process`, `fishing_gear`, `vessel_flag`, `vessel_name`, `vessel_no` |
| FK | `application_id REFERENCES applications(id)` |

### 인덱스 (docs/DB.md §5)

- `applications(origin_type)`, `applications(status)`
- `application_species(application_id)`
- `application_species(loff_id)`, `application_species(item_cd)`

## 출력 형식

불일치 항목:
```
❌ applications.doc_no — UNIQUE 제약 없음 (명세: UNIQUE NOT NULL)
❌ application_species — vessel_flag 컬럼 누락
❌ 인덱스 idx_species_loff 누락
```

이상 없으면:
```
DB 스키마 이상 없음 — applications(10컬럼) / application_species(17컬럼) / 인덱스 5개 일치
```

## 주의

- SQL은 대소문자 무관하게 비교합니다.
- `CREATE TABLE IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS` 구문도 정상으로 처리합니다.
- `db.ts`에 여러 `db.exec()` 호출이 있는 경우 모두 합산해서 비교합니다.
