import type { CoaItemRule } from "./schema";

/**
 * 수입산 품목 룰셋 — 품목별 원산지 허용국 목록.
 *
 * allowedCountries에 없는 (품목, 원산지) 조합 → ineligible.
 * defaultProcessingCountry: 가공국 기본값 (null = 원산지와 동일 또는 미지정).
 * 실서버 TC_ITEM_MASTER 압축본. DB.md §4.3 참조.
 */
export const COA_ITEM_LIST = [
  // ── 원물 (Raw) ────────────────────────────────────────────
  {
    id: "I-001",
    itemCd: "ITEM-SAL",
    itemNmKor: "연어 (원물)",
    itemNmEng: "Salmon (Raw)",
    scientificNm: "Salmo salar",
    hsk: "0302.11",
    allowedCountries: ["NOR", "ISL", "CAN", "AUS", "NZL", "CHL"],
    defaultProcessingCountry: null,
  },
  {
    id: "I-002",
    itemCd: "ITEM-COD",
    itemNmKor: "대구 (원물)",
    itemNmEng: "Cod (Raw)",
    scientificNm: "Gadus morhua",
    hsk: "0302.51",
    allowedCountries: ["NOR", "ISL", "GBR", "CAN"],
    defaultProcessingCountry: null,
  },
  {
    id: "I-003",
    itemCd: "ITEM-SHR",
    itemNmKor: "새우 (원물)",
    itemNmEng: "Shrimp (Raw)",
    scientificNm: "Penaeidae spp.",
    hsk: "0306.17",
    allowedCountries: ["THA", "IDN", "VNM", "IND", "BGD", "CHN", "AUS", "MMR", "KHM"],
    defaultProcessingCountry: null,
  },
  {
    id: "I-004",
    itemCd: "ITEM-OCT",
    itemNmKor: "문어 (원물)",
    itemNmEng: "Octopus (Raw)",
    scientificNm: "Octopus vulgaris",
    hsk: "0307.51",
    allowedCountries: ["MAR", "PER", "ARG", "JPN"],
    defaultProcessingCountry: null,
  },
  {
    id: "I-005",
    itemCd: "ITEM-TUN",
    itemNmKor: "참치 (원물)",
    itemNmEng: "Tuna (Raw)",
    scientificNm: "Thunnus thynnus",
    hsk: "0302.31",
    allowedCountries: ["JPN", "AUS", "NZL", "USA", "CHL", "PER"],
    defaultProcessingCountry: null,
  },

  // ── 가공품 (Processed) ─────────────────────────────────────
  {
    id: "I-006",
    itemCd: "ITEM-MAC-CAN",
    itemNmKor: "고등어 캔",
    itemNmEng: "Canned Mackerel",
    scientificNm: "Scomber japonicus",
    hsk: "1604.15",
    allowedCountries: ["NOR", "MAR", "CHL", "JPN", "GBR", "NZL"],
    defaultProcessingCountry: "KOR",
  },
  {
    id: "I-007",
    itemCd: "ITEM-TUN-CAN",
    itemNmKor: "참치 캔",
    itemNmEng: "Canned Tuna",
    scientificNm: "Thunnus thynnus",
    hsk: "1604.14",
    allowedCountries: ["JPN", "AUS", "NZL", "USA", "CHL", "PER"],
    defaultProcessingCountry: "KOR",
  },
  {
    id: "I-008",
    itemCd: "ITEM-SHR-FRZ",
    itemNmKor: "냉동 새우 가공품",
    itemNmEng: "Frozen Processed Shrimp",
    scientificNm: "Penaeidae spp.",
    hsk: "1605.21",
    allowedCountries: ["THA", "IDN", "VNM", "IND", "BGD", "CHN"],
    defaultProcessingCountry: "KOR",
  },
] as const satisfies readonly CoaItemRule[];
