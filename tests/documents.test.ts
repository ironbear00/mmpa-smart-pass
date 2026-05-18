import { describe, it, expect } from "vitest";
import { verifyDomestic } from "../src/engine/domestic";
import { verifyCoa } from "../src/engine/coa";
import {
  DOMESTIC_DOCS,
  CATCH_CERT_DOCS,
  COA_STANDARD_DOCS,
  COA_L3_EXEMPTION_DOCS,
} from "../src/rules/required-docs";

const AS_OF = new Date("2026-01-01");

// requiredDocs 매트릭스: 각 트랙별로 정확한 서류 목록이 반환되는지 검증
describe("requiredDocs 매트릭스", () => {
  describe("국내산 — DOMESTIC_DOCS", () => {
    it.each([
      {
        desc: "나잠 + 전복 + 남해 → eligible",
        input: { method: "naejam" as const, species: "haliotis" as const, region: "south-sea" as const },
      },
      {
        desc: "연승 + 참치 + WCPFC → eligible",
        input: { method: "yeonseung" as const, species: "tuna" as const, region: "WCPFC" as const },
      },
    ])("$desc", ({ input }) => {
      const result = verifyDomestic(input, AS_OF);
      expect(result.kind).toBe("eligible");
      expect(result.requiredDocs).toEqual([...DOMESTIC_DOCS]);
      expect(result.documentTrack).toBeUndefined();
    });
  });

  describe("수입산 L1 — CATCH_CERT_DOCS (catch_certificate 트랙)", () => {
    it.each([
      {
        desc: "노르웨이 + 연어 → L1 eligible",
        input: { countryCode: "NOR", itemCd: "ITEM-SAL" },
      },
      {
        desc: "미국 + 참치 → L1 eligible",
        input: { countryCode: "USA", itemCd: "ITEM-TUN" },
      },
      {
        desc: "일본 + 참치 캔 → L1 eligible",
        input: { countryCode: "JPN", itemCd: "ITEM-TUN-CAN" },
      },
    ])("$desc", ({ input }) => {
      const result = verifyCoa(input, AS_OF);
      expect(result.kind).toBe("eligible");
      expect(result.documentTrack).toBe("catch_certificate");
      expect(result.requiredDocs).toEqual([...CATCH_CERT_DOCS]);
    });
  });

  describe("수입산 L2 — COA_STANDARD_DOCS (coa 트랙)", () => {
    it.each([
      {
        desc: "칠레 + 연어 → L2 eligible",
        input: { countryCode: "CHL", itemCd: "ITEM-SAL" },
      },
      {
        desc: "태국 + 새우 → L2 eligible",
        input: { countryCode: "THA", itemCd: "ITEM-SHR" },
      },
      {
        desc: "모로코 + 고등어 캔 → L2 eligible",
        input: { countryCode: "MAR", itemCd: "ITEM-MAC-CAN" },
      },
    ])("$desc", ({ input }) => {
      const result = verifyCoa(input, AS_OF);
      expect(result.kind).toBe("eligible");
      expect(result.documentTrack).toBe("coa");
      expect(result.requiredDocs).toEqual([...COA_STANDARD_DOCS]);
    });
  });

  describe("수입산 L3 + fisheryExemption — COA_L3_EXEMPTION_DOCS", () => {
    it.each([
      {
        desc: "중국 + 새우 + 면제 입증 → L3 eligible",
        input: { countryCode: "CHN", itemCd: "ITEM-SHR", fisheryExemption: true },
      },
      {
        desc: "베트남 + 새우 가공품 + 면제 입증 → L3 eligible",
        input: { countryCode: "VNM", itemCd: "ITEM-SHR-FRZ", fisheryExemption: true },
      },
    ])("$desc", ({ input }) => {
      const result = verifyCoa(input, AS_OF);
      expect(result.kind).toBe("eligible");
      expect(result.documentTrack).toBe("coa");
      expect(result.requiredDocs).toEqual([...COA_L3_EXEMPTION_DOCS]);
    });
  });

  describe("비적격·조건부 — requiredDocs 없음", () => {
    it.each([
      {
        desc: "국가 미입력 → conditional",
        input: {},
        expectedKind: "conditional",
      },
      {
        desc: "L3 + fisheryExemption 없음 → ineligible",
        input: { countryCode: "CHN", itemCd: "ITEM-SHR", fisheryExemption: false },
        expectedKind: "ineligible",
      },
      {
        desc: "허용되지 않는 (국가, 품목) 조합 → ineligible",
        input: { countryCode: "NOR", itemCd: "ITEM-SHR" },
        expectedKind: "ineligible",
      },
    ])("$desc", ({ input, expectedKind }) => {
      const result = verifyCoa(input, AS_OF);
      expect(result.kind).toBe(expectedKind);
      expect(result.requiredDocs).toBeUndefined();
    });
  });
});
