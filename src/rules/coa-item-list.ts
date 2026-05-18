import type { CoaItemRule } from "./schema";

/**
 * 수입산 품목 룰셋 — 품목별 원산지 허용국 목록.
 *
 * itemType: 01=건제품 02=냉동품 03=냉장품 04=통조림 (TC_ITEM_MASTER.ITEM_TYPE, 실제 코드값 확인 필요)
 * itemTrtCd: 01=원물 02=냉동가공 03=통조림가공 (TC_ITEM_MASTER.ITEM_TRT_CD, 실제 코드값 확인 필요)
 * allowedCountries: enum-like 고정값. COA_COUNTRY_LIST 국가코드와 1:1 매핑.
 * defaultProcessingCountry: null=원산지 동일. 가공품은 KOR 고정.
 */
export const COA_ITEM_LIST = [
  // ── 원물 냉장품 (Raw) ─────────────────────────────────────
  {
    id: "I-001",
    itemCd: "ITEM-SAL", itemType: "03", itemTrtCd: "01",
    itemNmKor: "연어 (원물)", itemNmEng: "Salmon (Raw)",
    scientificNm: "Salmo salar", hsk: "0302.11",
    allowedCountries: ["NOR", "ISL", "CAN", "AUS", "NZL", "CHL"],
    defaultProcessingCountry: null,
  },
  {
    id: "I-002",
    itemCd: "ITEM-COD", itemType: "03", itemTrtCd: "01",
    itemNmKor: "대구 (원물)", itemNmEng: "Cod (Raw)",
    scientificNm: "Gadus morhua", hsk: "0302.51",
    allowedCountries: ["NOR", "ISL", "GBR", "CAN"],
    defaultProcessingCountry: null,
  },
  {
    id: "I-003",
    itemCd: "ITEM-SHR", itemType: "03", itemTrtCd: "01",
    itemNmKor: "새우 (원물)", itemNmEng: "Shrimp (Raw)",
    scientificNm: "Penaeidae spp.", hsk: "0306.17",
    allowedCountries: ["THA", "IDN", "VNM", "IND", "BGD", "CHN", "AUS", "MMR", "KHM"],
    defaultProcessingCountry: null,
  },
  {
    id: "I-004",
    itemCd: "ITEM-OCT", itemType: "03", itemTrtCd: "01",
    itemNmKor: "문어 (원물)", itemNmEng: "Octopus (Raw)",
    scientificNm: "Octopus vulgaris", hsk: "0307.51",
    allowedCountries: ["MAR", "PER", "ARG", "JPN"],
    defaultProcessingCountry: null,
  },
  {
    id: "I-005",
    itemCd: "ITEM-TUN", itemType: "03", itemTrtCd: "01",
    itemNmKor: "참치 (원물)", itemNmEng: "Tuna (Raw)",
    scientificNm: "Thunnus thynnus", hsk: "0302.31",
    allowedCountries: ["JPN", "AUS", "NZL", "USA", "CHL", "PER"],
    defaultProcessingCountry: null,
  },

  // ── 가공품 (Processed) ─────────────────────────────────────
  {
    id: "I-006",
    itemCd: "ITEM-MAC-CAN", itemType: "04", itemTrtCd: "03",
    itemNmKor: "고등어 캔", itemNmEng: "Canned Mackerel",
    scientificNm: "Scomber japonicus", hsk: "1604.15",
    allowedCountries: ["NOR", "MAR", "CHL", "JPN", "GBR", "NZL"],
    defaultProcessingCountry: "KOR",
  },
  {
    id: "I-007",
    itemCd: "ITEM-TUN-CAN", itemType: "04", itemTrtCd: "03",
    itemNmKor: "참치 캔", itemNmEng: "Canned Tuna",
    scientificNm: "Thunnus thynnus", hsk: "1604.14",
    allowedCountries: ["JPN", "AUS", "NZL", "USA", "CHL", "PER"],
    defaultProcessingCountry: "KOR",
  },
  {
    id: "I-008",
    itemCd: "ITEM-SHR-FRZ", itemType: "02", itemTrtCd: "02",
    itemNmKor: "냉동 새우 가공품", itemNmEng: "Frozen Processed Shrimp",
    scientificNm: "Penaeidae spp.", hsk: "1605.21",
    allowedCountries: ["THA", "IDN", "VNM", "IND", "BGD", "CHN"],
    defaultProcessingCountry: "KOR",
  },
] as const satisfies readonly CoaItemRule[];
