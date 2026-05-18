# 테스트 데이터 가이드 (PoC)

> `DESIGN.md` §6·§16, `DB.md` 종속. **데이터 분포 원칙**만 정의한다. 실제 룰셋·fixture 작성은 본 가이드를 따라 `src/rules/*.ts`, `tests/fixtures/*.json`에서 수행.

---

## 1. 분포 원칙 (왜 분포가 중요한가)

엔진 정답률(D1)은 케이스가 한쪽으로 쏠리면 의미가 없다. eligible만 30건 만들고 검증하면 `verifyDomestic`이 항상 eligible을 반환해도 통과한다.

→ `Verdict.kind` 4종에 의도적으로 분산. ineligible·unknown 케이스가 없으면 D2(반려 사유)·시간 의존성(`asOf`)이 검증되지 않는다.

---

## 2. 케이스 분포 (각 흐름 30건)

| `Verdict.kind` | 국내산 | 수입산 | 검증 항목 |
|---|---|---|---|
| `eligible` | 12 | 12 | D1 정답 케이스 |
| `conditional` | 8 | 8 | 입력 부분 충족 시 `nextStepEnabled=false` |
| `ineligible` | 7 | 7 | 반려 사유 자연어 출력 (D2) |
| `unknown` | 3 | 3 | `effectiveTo` 경과 / 룰셋 미수록 |

---

## 3. 룰셋 분포 (총 50행)

| 룰셋 | 행수 | 차원 |
|---|---|---|
| `LOFF_RULESET` (국내산) | 30 | 어법 × 어종 × 해역 |
| `COA_COUNTRY_LIST` (수입산 국가) | 20 | 국가 × listGrade |
| `COA_ITEM_LIST` (수입산 품목) | (별도) | `TC_ITEM_MASTER` 압축 |

룰셋 갱신 시연(D4)을 위해 일부 행은 의도적으로 누락. 누락 행이 곧 unknown·ineligible 케이스의 근거.

---

## 4. 국내산 룰셋 가이드라인

### 4.1 차원 출처

| 차원 | 실서버 컬럼 | PoC 처리 |
|---|---|---|
| `method` (어법) | `TN_CA_LOFF_INFO.FISHERY_MTHD` | 자유 문자열 → enum |
| `species` (어종) | `TN_CA_LOFF_SPECIES.SPECIES_NM` | 자유 문자열 → enum |
| `region` (해역) | `TN_CA_LOFF_INFO.FISHERY_AREA` | 자유 문자열 → ISO 3166-2:KR 코드 |

실서버는 자유 문자열, PoC는 식별자. 문자열 매칭이 아닌 식별자 매칭이어야 트리오 미스를 빌드타임에 잡는다.

### 4.2 30행 작성 규칙

- 어법은 최소 6종 이상 (PoC 도메인 폭 확보)
- 해역은 최소 6개 이상
- 어종은 8종 내외
- **어법 6 × 어종 8 × 해역 6 = 288 조합 중 30건만 등재.** 등재되지 않은 조합이 ineligible 케이스의 재료
- `effectiveFrom` 다수는 `'2024-01-01'`, **3건 정도는 `'2025-06-01'`** (시간 의존성 테스트용)
- `effectiveTo` 다수는 `null`, **3건은 `'2025-12-31'`** (asOf=2026 시점 unknown 유도)

### 4.3 ID 명명

- 룰 ID: `R-LOFF-{0001..0030}`
- `loffId`: `LOFF-{어법2자}-{어종3자}-{해역2자}` (예: `LOFF-NJ-HAL-26`)

실서버 `LOFF_ID` 패턴은 `D250001-001` 형태의 무의미한 시퀀스지만 PoC는 디버그 가독성이 우선.

---

## 5. 수입산 룰셋 가이드라인

### 5.1 두 룰셋의 분리

수입산은 **국가 등급 판정**과 **품목 적격성 판정**이 독립이다. 따라서 룰셋도 둘.

```
COA_COUNTRY_LIST  →  국가 → listGrade(L1/L2/L3)
COA_ITEM_LIST     →  품목 → 허용 국가 배열
```

### 5.2 `COA_COUNTRY_LIST` (20행)

- 국가 코드는 ISO 3166-1 alpha-3
- listGrade 기준은 **사용자 원본 데이터 수령 후 작성**
- L1/L2/L3 각 그룹에 최소 4건씩
- L3 국가 일부는 만료 처리(`effectiveTo` 설정)해 unknown 유도

### 5.3 `COA_ITEM_LIST`

`TC_ITEM_MASTER`에서 PoC에 필요한 컬럼만 추출.

| PoC 컬럼 | 실서버 컬럼 |
|---|---|
| `itemCd` | `ITEM_CD` |
| `itemNmKor`, `itemNmEng` | `ITEM_NM_KOR`, `ITEM_NM_ENG` |
| `scientificNm` | `SCIENTIFIC_NM_ENG` |
| `hsk` | `HSK_CD` |
| `allowedCountries` | **신규.** 품목별 수입 허용국 배열 |

`ITEM_TYPE`, `INSP_CLS_CD`, `ITEM_TRT_CD`, `CNT_UNIT`, `EXP_IMP_TYPE`, `ORIGINALITY`, `DEVICE_TYPE`, `MAP_CD*`, `ORDER_CD`/`FAMILY_CD`/`GENUS_CD`/`SPECIES_CD` 등 분류·행정 코드는 **모두 제거**.

`allowedCountries`가 핵심 신규 필드. "모든 품목이 모든 국가에서 수입 가능"이 아니라는 도메인 제약을 표현한다. 이 필드가 ineligible 케이스(품목-국가 조합 불허) 7건의 재료.

---

## 6. fixture 형식

```json
{
  "id": "DOM-001",
  "description": "내연망 + 전복 + 부산 → 유효",
  "input": { "method": "...", "species": "...", "region": "..." },
  "asOf": "2025-06-15",
  "expectedVerdict": {
    "kind": "eligible",
    "loffId": "...",
    "matchedRuleId": "R-LOFF-0001",
    "nextStepEnabled": true
  },
  "expectedMessage": "..."   // ineligible/conditional 케이스에만
}
```

- `asOf`를 케이스마다 명시 → 시간 의존성을 fixture 레벨에서 고정. `new Date()` 의존 금지.
- `expectedMessage`는 ineligible 케이스 7건과 conditional 일부에 등록 → D2 스냅샷 테스트 재료.

---

## 7. 케이스 작성 시 분배 규칙

### 7.1 국내산 30건

- eligible 12건: 어법 6종 / 해역 6개 모두 최소 1건씩 등장
- conditional 8건: 1개 누락 4건, 2개 누락 4건
- ineligible 7건: 어법-어종 불가 3건, 어종-해역 불가 3건, 전조합 불가 1건
- unknown 3건: `effectiveTo` 경과 2건, 룰셋 미수록 신규 어종 1건

### 7.2 수입산 30건

- eligible 12건: L1·L2·L3 각 4건씩
- conditional 8건: 국가만 입력(`listGrade`는 결정), 국가+품목(가공국 누락) 등
- ineligible 7건: `allowedCountries`에 없는 (품목, 국가) 조합
- unknown 3건: 등급 미정 국가 / 만료 룰

---

## 8. 신청 이력 시드 (D3용)

룰셋과 별개로, 수동 시연(D3: 저장·재기동 후 조회)을 위한 신청 이력 시드.

- `applications` 10건 내외
  - `status='draft'` 4건, `'submitted'` 4건, `'rejected'` 2건
  - 국내산·수입산 5:5
- `application_species` 평균 2건씩 (총 20행 내외)
- 모든 행의 `verdict_snapshot`은 룰셋 매칭 결과 그대로 JSON 직렬화

자동 테스트는 fixture로 충분. 시드는 시연용.

---

## 9. 거버넌스

| 변경 | 절차 |
|---|---|
| 룰셋 1행 추가/수정 | `src/rules/*.ts` 수정 → Zod 검증 → 테스트 → 재기동 |
| fixture 추가 | `tests/fixtures/*.json` 수정 → `pnpm test` |
| 분포 원칙 변경 | 본 문서 갱신 + `DECISIONS.md` ADR |

---

**문서 버전**: v1 / **상태**: 확정.
