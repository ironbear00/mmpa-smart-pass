새 룰셋 항목을 `src/rules/` 파일에 추가합니다. ID 자동 채번, 형식 검증, `as const satisfies` 유지까지 처리합니다.

## 대상 룰셋 결정

인자 없이 실행하면 어느 룰셋에 추가할지 먼저 묻습니다:
1. **LOFF** — `src/rules/loff-ruleset.ts` (국내산: 어법 × 어종 × 해역)
2. **COA 국가** — `src/rules/coa-country-list.ts` (수입산 국가 등급)
3. **COA 품목** — `src/rules/coa-item-list.ts` (수입산 품목)

인자로 룰셋 종류를 지정할 수도 있습니다 (`/ruleset-add loff`, `/ruleset-add coa-country` 등).

---

## LOFF 룰 추가 (`loff-ruleset.ts`)

### 필드

| 필드 | 타입 | 허용값 |
|------|------|--------|
| `method` | LoffMethod | `naejam` / `yeonseung` / `jamang` / `troll` / `jeongchimang` / `yangshik` |
| `species` | LoffSpecies | `haliotis` / `rockfish` / `flatfish` / `seabream` / `pollock` / `mackerel` / `tuna` / `clam` |
| `region` | LoffRegion | `east-sea` / `west-sea` / `south-sea` / `WCPFC` / `IOTC` / `IATTC` / `ICCAT` |
| `effectiveFrom` | YYYY-MM-DD | — |
| `effectiveTo` | YYYY-MM-DD \| null | 만료 없으면 `null` |

### ID 채번

1. `src/rules/loff-ruleset.ts`를 읽어 기존 `R-LOFF-NNNN` 중 최대 N을 확인합니다.
2. 다음 ID = `R-LOFF-{max+1}` (4자리 zero-padding).
3. `loffId` = `LOFF-{method 2자 대문자}-{species 3자 대문자}-{region 약자 2자 대문자}`.
   - region 약자: `east-sea`→`ES`, `west-sea`→`WS`, `south-sea`→`SS`, `WCPFC`→`WC`, `IOTC`→`IO`, `IATTC`→`IA`, `ICCAT`→`IC`

### 중복 검사

동일한 `(method, species, region)` 조합이 이미 존재하면 추가를 중단하고 "이미 등재된 조합입니다: R-LOFF-XXXX" 경고를 출력합니다.

---

## COA 국가 룰 추가 (`coa-country-list.ts`)

### 필드

| 필드 | 타입 | 비고 |
|------|------|------|
| `countryCode` | ISO 3166-1 alpha-3 (3글자 대문자) | — |
| `countryNm` | string | 한국어 국가명 |
| `listGrade` | `"L1"` / `"L2"` / `"L3"` | — |
| `effectiveFrom` | YYYY-MM-DD | — |
| `effectiveTo` | YYYY-MM-DD \| null | — |

### ID 채번

기존 `R-COA-NNNN` 최대값 + 1, 4자리 zero-padding.

---

## COA 품목 추가 (`coa-item-list.ts`)

### 필드

| 필드 | 타입 | 비고 |
|------|------|------|
| `itemCd` | string | — |
| `itemNmKor` | string | 한국어 품목명 |
| `itemNmEng` | string | 영문 품목명 |
| `scientificNm` | string | 학명 |
| `hsk` | `HHHH.HH` 형식 | — |
| `allowedCountries` | string[] | ISO 3166-1 alpha-3 배열 |

### ID 채번

기존 `I-NNN` 최대값 + 1, 3자리 zero-padding.

---

## 공통 처리 절차

1. 사용자로부터 필드 값을 받습니다 (대화로 수집하거나 인자에서 파싱).
2. 위 형식 규칙으로 유효성 검사. 실패 시 수정 요청 후 진행.
3. ID 채번 및 `loffId` 생성.
4. 해당 파일을 읽어 배열의 마지막 `}` 앞에 새 항목을 삽입합니다.
5. `as const satisfies readonly T[]` 패턴이 파일 끝에 유지되는지 확인합니다.
6. 추가 후 추가된 항목의 ID와 내용을 한 줄로 보고합니다.

## 추가 후 권장 확인

```
pnpm typecheck   # 타입 오류 없는지
/layer-check     # 레이어 규칙 이상 없는지
```
