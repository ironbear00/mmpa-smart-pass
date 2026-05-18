import type { Verdict, DocumentTrack } from "./types";
import { COA_COUNTRY_LIST } from "../rules/coa-country-list";
import { COA_ITEM_LIST } from "../rules/coa-item-list";
import { CATCH_CERT_DOCS, COA_STANDARD_DOCS, COA_L3_EXEMPTION_DOCS } from "../rules/required-docs";

export interface CoaInput {
  countryCode: string;
  itemCd: string;
  fisheryExemption?: boolean;  // L3 국가에서만 유효. true = MMPA 미적용 어업 입증
}

export function verifyCoa(
  input: Partial<CoaInput>,
  asOf: Date = new Date()
): Verdict {
  const { countryCode, itemCd, fisheryExemption } = input;
  const asOfStr = asOf.toISOString().slice(0, 10);

  if (!countryCode) {
    return {
      kind: "conditional",
      message: "원산지 국가를 선택해 주세요.",
      missing: ["countryCode", "itemCd"],
      nextStepEnabled: false,
    };
  }

  const countryRule = COA_COUNTRY_LIST.find((r) => r.countryCode === countryCode);

  if (!countryRule) {
    return {
      kind: "ineligible",
      message: `${countryCode}은(는) 등록되지 않은 원산지 국가입니다.`,
      nextStepEnabled: false,
    };
  }

  if (asOfStr < countryRule.effectiveFrom) {
    return {
      kind: "unknown",
      message: `${countryRule.countryNm}의 등급 정보는 ${countryRule.effectiveFrom}부터 유효합니다. 담당자에게 문의하세요.`,
      matchedRuleId: countryRule.id,
      nextStepEnabled: false,
    };
  }
  if (countryRule.effectiveTo !== null && asOfStr > countryRule.effectiveTo) {
    return {
      kind: "unknown",
      listGrade: countryRule.listGrade,
      message: `${countryRule.countryNm}의 등급 정보가 ${countryRule.effectiveTo}에 만료되었습니다. 담당자에게 문의하세요.`,
      matchedRuleId: countryRule.id,
      nextStepEnabled: false,
    };
  }

  const { listGrade } = countryRule;

  if (!itemCd) {
    return {
      kind: "conditional",
      listGrade,
      message: `${countryRule.countryNm}은(는) ${listGrade} 등급 국가입니다. 품목을 선택해 주세요.`,
      missing: ["itemCd"],
      matchedRuleId: countryRule.id,
      nextStepEnabled: false,
    };
  }

  const itemRule = COA_ITEM_LIST.find((i) => i.itemCd === itemCd);

  if (!itemRule) {
    return {
      kind: "ineligible",
      listGrade,
      message: `${itemCd}은(는) 등록되지 않은 수입 품목입니다.`,
      nextStepEnabled: false,
    };
  }

  if (!(itemRule.allowedCountries as readonly string[]).includes(countryCode)) {
    return {
      kind: "ineligible",
      listGrade,
      message: `${itemRule.itemNmKor}은(를) ${countryRule.countryNm}에서 수입이 허용되지 않는 품목입니다.`,
      matchedRuleId: countryRule.id,
      nextStepEnabled: false,
    };
  }

  // 원산지 + 품목 확인 완료 — 등급별 최종 판정
  const documentTrack: DocumentTrack = listGrade === "L1" ? "catch_certificate" : "coa";

  if (listGrade === "L3") {
    if (!fisheryExemption) {
      return {
        kind: "ineligible",
        listGrade,
        message: `${countryRule.countryNm}은(는) L3 등급 국가로 원칙적으로 수입이 금지됩니다. MMPA 미적용 어업에서 생산된 것이 입증되는 경우에만 신청 가능합니다.`,
        matchedRuleId: countryRule.id,
        nextStepEnabled: false,
      };
    }
    return {
      kind: "eligible",
      listGrade,
      documentTrack: "coa",
      message: `신청 가능합니다. 등급: L3 (항구 추가 심사 대상)`,
      requiredDocs: [...COA_L3_EXEMPTION_DOCS],
      matchedRuleId: countryRule.id,
      nextStepEnabled: true,
    };
  }

  return {
    kind: "eligible",
    listGrade,
    documentTrack,
    message: `신청 가능합니다. 등급: ${listGrade}`,
    requiredDocs: documentTrack === "catch_certificate" ? [...CATCH_CERT_DOCS] : [...COA_STANDARD_DOCS],
    matchedRuleId: countryRule.id,
    nextStepEnabled: true,
  };
}
