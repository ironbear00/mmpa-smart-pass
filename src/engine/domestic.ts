import type { LoffMethod, LoffSpecies, LoffRegion } from "../rules/schema";
import type { Verdict } from "./types";
import { LOFF_RULESET } from "../rules/loff-ruleset";
import { DOMESTIC_DOCS } from "../rules/required-docs";

export interface DomesticInput {
  method: LoffMethod;
  species: LoffSpecies;
  region: LoffRegion;
}

const METHOD_NAMES: Record<LoffMethod, string> = {
  naejam: "나잠", yeonseung: "연승", jamang: "자망",
  troll: "트롤", jeongchimang: "정치망", yangshik: "양식",
};

const SPECIES_NAMES: Record<LoffSpecies, string> = {
  haliotis: "전복", rockfish: "조피볼락", flatfish: "가자미",
  seabream: "참돔", pollock: "명태", mackerel: "고등어",
  tuna: "참치", clam: "대합",
};

const REGION_NAMES: Record<LoffRegion, string> = {
  "east-sea": "동해", "west-sea": "서해", "south-sea": "남해",
  "WCPFC": "WCPFC (서중앙태평양)", "IOTC": "IOTC (인도양)",
  "IATTC": "IATTC (동태평양)", "ICCAT": "ICCAT (대서양)",
};

export function verifyDomestic(
  input: Partial<DomesticInput>,
  asOf: Date = new Date()
): Verdict {
  const { method, species, region } = input;

  if (!method) {
    return {
      kind: "conditional",
      message: "어법을 선택해 주세요.",
      missing: ["method", "species", "region"],
      nextStepEnabled: false,
    };
  }
  if (!species) {
    return {
      kind: "conditional",
      message: "어종을 선택해 주세요.",
      missing: ["species", "region"],
      nextStepEnabled: false,
    };
  }
  if (!region) {
    return {
      kind: "conditional",
      message: "해역을 선택해 주세요.",
      missing: ["region"],
      nextStepEnabled: false,
    };
  }

  const asOfStr = asOf.toISOString().slice(0, 10);

  const rule = LOFF_RULESET.find(
    (r) => r.method === method && r.species === species && r.region === region
  );

  if (!rule) {
    return {
      kind: "ineligible",
      message: `${METHOD_NAMES[method]} 어법으로 ${SPECIES_NAMES[species]}을(를) ${REGION_NAMES[region]} 해역에서 조업한 수산물은 수출확인증명 대상이 아닙니다.`,
      nextStepEnabled: false,
    };
  }

  if (asOfStr < rule.effectiveFrom) {
    return {
      kind: "unknown",
      message: `해당 조합은 ${rule.effectiveFrom}부터 유효합니다. 담당자에게 문의하세요.`,
      matchedRuleId: rule.id,
      nextStepEnabled: false,
    };
  }
  if (rule.effectiveTo !== null && asOfStr > rule.effectiveTo) {
    return {
      kind: "unknown",
      message: `해당 조합은 ${rule.effectiveTo}에 만료되었습니다. 담당자에게 문의하세요.`,
      matchedRuleId: rule.id,
      nextStepEnabled: false,
    };
  }

  return {
    kind: "eligible",
    loffId: rule.loffId,
    message: `신청 가능합니다. LOFF ID: ${rule.loffId}`,
    requiredDocs: [...DOMESTIC_DOCS],
    matchedRuleId: rule.id,
    nextStepEnabled: true,
  };
}
