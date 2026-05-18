import { z } from "zod";

// --- 공통 ---

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식 필요");

// --- 국내산 Enum ---

export const LoffMethodEnum = z.enum([
  "naejam",        // 나잠 (잠수어업)
  "yeonseung",     // 연승
  "jamang",        // 자망
  "troll",         // 트롤
  "jeongchimang",  // 정치망
  "yangshik",      // 양식
]);

export const LoffSpeciesEnum = z.enum([
  "haliotis",  // 전복
  "rockfish",  // 조피볼락
  "flatfish",  // 가자미
  "seabream",  // 참돔
  "pollock",   // 명태
  "mackerel",  // 고등어
  "tuna",      // 참치
  "clam",      // 대합
]);

export const LoffRegionEnum = z.enum([
  "east-sea",   // 동해
  "west-sea",   // 서해
  "south-sea",  // 남해
  "WCPFC",      // 서중앙태평양어업위원회
  "IOTC",       // 인도양참치위원회
  "IATTC",      // 미주열대참치위원회
  "ICCAT",      // 대서양참치보존국제위원회
]);

// --- 수입산 Enum ---

export const ListGradeEnum = z.enum(["L1", "L2", "L3"]);

// --- 스키마 ---

export const LoffRuleSchema = z.object({
  id: z.string().regex(/^R-LOFF-\d{4}$/, "R-LOFF-NNNN 형식"),
  loffNo: z.number().int().positive(),              // TN_CA_LOFF_INFO.LOFF_NO
  fisheryCd: z.string().length(2),                 // TN_CA_LOFF_INFO.FISHERY_CD (수역코드)
  method: LoffMethodEnum,
  species: LoffSpeciesEnum,
  region: LoffRegionEnum,
  loffId: z.string().regex(/^LOFF-[A-Z]{2}-[A-Z]{3}-[A-Z]{2}$/, "LOFF-XX-XXX-XX 형식"),
  equalLoffIds: z.array(z.string()),               // TN_MMPA_CA_SPECIES.EQUAL_LOFF_ID_LIST
  effectiveFrom: isoDate,
  effectiveTo: isoDate.nullable(),
});

export const CoaCountryRuleSchema = z.object({
  id: z.string().regex(/^R-COA-\d{4}$/, "R-COA-NNNN 형식"),
  countryCode: z.string().length(3, "ISO 3166-1 alpha-3 필요"),
  countryNm: z.string().min(1),
  listGrade: ListGradeEnum,
  effectiveFrom: isoDate,
  effectiveTo: isoDate.nullable(),
});

export const CoaItemRuleSchema = z.object({
  id: z.string().regex(/^I-\d{3}$/, "I-NNN 형식"),
  itemCd: z.string().min(1),
  itemType: z.string().length(2),                  // TC_ITEM_MASTER.ITEM_TYPE (01:건 02:냉동 03:냉장 04:통조림)
  itemTrtCd: z.string().length(2),                 // TC_ITEM_MASTER.ITEM_TRT_CD (01:원물 02:냉동 03:가공)
  itemNmKor: z.string().min(1),
  itemNmEng: z.string().min(1),
  scientificNm: z.string().min(1),
  hsk: z.string().regex(/^\d{4}\.\d{2}$/, "HHHH.HH 형식"),
  allowedCountries: z.array(z.string().length(3, "ISO 3166-1 alpha-3")),
  defaultProcessingCountry: z.string().length(3, "ISO 3166-1 alpha-3").nullable(),
});

// --- 타입 ---

export type LoffMethod = z.infer<typeof LoffMethodEnum>;
export type LoffSpecies = z.infer<typeof LoffSpeciesEnum>;
export type LoffRegion = z.infer<typeof LoffRegionEnum>;
export type ListGrade = z.infer<typeof ListGradeEnum>;
export type LoffRule = z.infer<typeof LoffRuleSchema>;
export type CoaCountryRule = z.infer<typeof CoaCountryRuleSchema>;
export type CoaItemRule = z.infer<typeof CoaItemRuleSchema>;
