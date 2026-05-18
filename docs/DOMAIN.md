# MMPA 도메인 지식

> `MMPA_SmartPass.md` §4·§6·§8 종속. 설계서가 정의하지 않은 도메인 상식을 보충한다.

---

## 1. 핵심 용어

| 용어 | 설명 |
|---|---|
| 수출확인증명 | 수산물 해외 수출 시 필요한 정부 확인 서류 |
| LOFF | 국내산 어업 허가 정보. 어법·어종·해역 조합으로 식별됨 |
| COA | 수입산 수산물 원산지 이력 등급 (L1/L2/L3) |
| 어법 | 수산물을 잡는 방법 (나잠, 연승, 자망 등) |
| 어종 | 수산물의 종류 (전복, 고등어 등) |
| 해역 | 수산물을 잡은 해역 (연근해: east-sea/west-sea/south-sea, 원양 RFMO: WCPFC/IOTC/IATTC/ICCAT) |
| loffId | 어법+어종+해역 조합의 고유 식별자 (`LOFF-XX-XXX-XX` 형식) |
| listGrade | 수입 원산지국 등급 (L1=우수, L2=보통, L3=주의) |

---

## 2. 국내산 흐름

어법(method) × 어종(species) × 해역(region) 조합이 LOFF 룰셋에 있으면 `eligible`.
세 값이 모두 입력될 때까지 `conditional`. 룰셋에 없으면 `ineligible`.

```
입력 단계            Verdict.kind
[어법]             → conditional (missing: species, region)
[어법 + 어종]      → conditional (missing: region)
[어법 + 어종 + 해역] → eligible (loffId 확정) or ineligible
```

---

## 3. 수입산 흐름

등급 판정(listGrade)과 적격 판정(eligible)은 분리된다. L2 국가도 조건 충족 시 eligible.

```
입력 단계                 Verdict
[국가]                 → conditional, listGrade 결정
[국가 + 품목]           → conditional (missing: processingCountry)
[국가 + 품목 + 가공국]   → eligible or ineligible
```

---

## 4. 어법 (method) 식별자

| 식별자 | 한국어 | loffId 약어 | 설명 |
|---|---|---|---|
| naejam | 나잠 | NJ | 잠수어업 (breath-hold diving) |
| yeonseung | 연승 | YS | 낚시줄을 수평으로 길게 늘어뜨리는 어법 |
| jamang | 자망 | JM | 그물을 수직으로 세워 고기를 걸리게 하는 어법 |
| troll | 트롤 | TR | 저인망·트롤 어법 |
| jeongchimang | 정치망 | JC | 일정 장소에 고정 설치하는 그물 어법 |
| yangshik | 양식 | YK | 수산물 양식업 |

---

## 5. 어종 (species) 식별자

| 식별자 | 한국어 | 학명 | loffId 약어 |
|---|---|---|---|
| haliotis | 전복 | Haliotis discus hannai | HAL |
| rockfish | 조피볼락 | Sebastes schlegelii | ROC |
| flatfish | 가자미 | Paralichthys olivaceus | FLT |
| seabream | 참돔 | Pagrus major | SBR |
| pollock | 명태 | Gadus chalcogrammus | PLK |
| mackerel | 고등어 | Scomber japonicus | MCK |
| tuna | 참치 | Thunnus spp. | TUN |
| clam | 대합 | Meretrix lusoria | CLM |

---

## 6. 해역 (region) 코드

해역은 연근해와 원양 RFMO 수역으로 구분된다. 행정구역 코드(KR-XX)가 아님에 주의.

### 연근해

| 코드 | 한국어 | loffId 약어 |
|---|---|---|
| east-sea | 동해 | ES |
| west-sea | 서해 | WS |
| south-sea | 남해 | SS |

### 원양 RFMO

| 코드 | 기구명 | 관할 수역 | loffId 약어 |
|---|---|---|---|
| WCPFC | 서중앙태평양어업위원회 | 서태평양·중부태평양 | WC |
| IOTC | 인도양참치위원회 | 인도양 | IO |
| IATTC | 미주열대참치위원회 | 동태평양 | IA |
| ICCAT | 대서양참치보존국제위원회 | 대서양 | IC |

### 어법별 허용 해역

| 어법 | 허용 해역 |
|---|---|
| 나잠 | 남해, 동해 (전복) / 서해 (대합) |
| 연승 | WCPFC, IOTC, IATTC, ICCAT (참치) |
| 자망 | 동해, 서해 (가자미) / 동해, 남해 (조피볼락) |
| 트롤 | 동해 (명태) / 남해 (고등어) |
| 정치망 | 남해, 동해 (고등어) / 남해 (조피볼락) |
| 양식 | 남해, 동해 (전복) / 남해 (참돔, 조피볼락) |

---

## 7. listGrade 기준 (수입산)

| 등급 | 의미 | UI 배지 색상 | 필요 추가 서류 |
|---|---|---|---|
| L1 | 이력 우수국 | 녹색 | 없음 |
| L2 | 이력 보통국 | 황색 | 없음 |
| L3 | 이력 주의국 | 적색 | 추가 서류 필요 |

**중요**: 등급은 적격성과 무관. L3 국가도 품목·가공국 조합이 허용이면 `eligible`.
배지는 등급 표시일 뿐, 반려 여부는 `Verdict.kind`가 결정.

### 미국(USA) L1 특례

미국산 원료는 수입·수출 도메인 규정상 **L1(이력 우수국)으로 취급**한다.
`coa-country-list.ts`의 `R-COA-0008` 항목이 `listGrade: "L1"`인 근거.
섹션 주석 순서상 L2 블록 위에 배치되어 있으나 데이터 값이 우선한다.

---

## 8. Verdict.kind → UI 매핑

| kind | 색상 | 사용자 메시지 | 다음 버튼 |
|---|---|---|---|
| eligible | 녹색 배지 슬라이드 인 | 신청 가능 + 필요 서류 안내 | 활성화 |
| ineligible | 적색 배지 | 반려 사유 자연어 표시 | 잠금 |
| conditional | 없음 | 추가 입력 필요 항목 안내 | 잠금 |
| unknown | 황색 배지 | "수동 검토 필요" 안내 | 잠금 |
