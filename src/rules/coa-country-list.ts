import type { CoaCountryRule } from "./schema";

export const COA_COUNTRY_LIST = [

  // ── L1 이력 우수국 (8건, 미국 포함) ─────────────────────
  {
    id: "R-COA-0001", countryCode: "NOR", countryNm: "노르웨이",
    listGrade: "L1", effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-COA-0002", countryCode: "ISL", countryNm: "아이슬란드",
    listGrade: "L1", effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-COA-0003", countryCode: "CAN", countryNm: "캐나다",
    listGrade: "L1", effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-COA-0004", countryCode: "AUS", countryNm: "호주",
    listGrade: "L1", effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-COA-0005", countryCode: "NZL", countryNm: "뉴질랜드",
    listGrade: "L1", effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-COA-0006", countryCode: "GBR", countryNm: "영국",
    listGrade: "L1", effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-COA-0007", countryCode: "JPN", countryNm: "일본",
    listGrade: "L1", effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-COA-0008", countryCode: "USA", countryNm: "미국",
    listGrade: "L1", effectiveFrom: "2024-01-01", effectiveTo: null,
  },

  // ── L2 이력 보통국 (6건) ────────────────────────────────
  {
    id: "R-COA-0009", countryCode: "CHL", countryNm: "칠레",
    listGrade: "L2", effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-COA-0010", countryCode: "PER", countryNm: "페루",
    listGrade: "L2", effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-COA-0011", countryCode: "MAR", countryNm: "모로코",
    listGrade: "L2", effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-COA-0012", countryCode: "THA", countryNm: "태국",
    listGrade: "L2", effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-COA-0013", countryCode: "IDN", countryNm: "인도네시아",
    listGrade: "L2", effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-COA-0014", countryCode: "ARG", countryNm: "아르헨티나",
    listGrade: "L2", effectiveFrom: "2024-01-01", effectiveTo: null,
  },

  // ── L3 이력 주의국 (4건 활성 + 2건 만료) ──────────────────
  {
    id: "R-COA-0015", countryCode: "CHN", countryNm: "중국",
    listGrade: "L3", effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-COA-0016", countryCode: "VNM", countryNm: "베트남",
    listGrade: "L3", effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-COA-0017", countryCode: "IND", countryNm: "인도",
    listGrade: "L3", effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-COA-0018", countryCode: "BGD", countryNm: "방글라데시",
    listGrade: "L3", effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  // 만료 → asOf=2026 기준 unknown 유도
  {
    id: "R-COA-0019", countryCode: "MMR", countryNm: "미얀마",
    listGrade: "L3", effectiveFrom: "2024-01-01", effectiveTo: "2025-06-30",
  },
  {
    id: "R-COA-0020", countryCode: "KHM", countryNm: "캄보디아",
    listGrade: "L3", effectiveFrom: "2024-01-01", effectiveTo: "2025-03-31",
  },

] as const satisfies readonly CoaCountryRule[];
