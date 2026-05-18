import { describe, it, expect } from "vitest";
import { verifyDomestic } from "../src/engine/domestic";
import type { DomesticInput } from "../src/engine/domestic";
import cases from "./fixtures/domestic-cases.json";

type ExpectedVerdict = {
  kind: string;
  nextStepEnabled: boolean;
  loffId?: string;
  matchedRuleId?: string;
  missing?: string[];
};

describe("verifyDomestic", () => {
  it.each(cases)("$id: $description", ({ input, asOf, expectedVerdict }) => {
    const result = verifyDomestic(input as Partial<DomesticInput>, new Date(asOf));
    const expected = expectedVerdict as ExpectedVerdict;

    expect(result.kind).toBe(expected.kind);
    expect(result.nextStepEnabled).toBe(expected.nextStepEnabled);

    if (expected.loffId !== undefined) {
      expect(result.loffId).toBe(expected.loffId);
    }
    if (expected.matchedRuleId !== undefined) {
      expect(result.matchedRuleId).toBe(expected.matchedRuleId);
    }
    if (expected.missing !== undefined) {
      expect(result.missing).toEqual(expected.missing);
    }
    if (expected.kind === "ineligible" || expected.kind === "unknown") {
      expect(typeof result.message).toBe("string");
      expect(result.message.length).toBeGreaterThan(0);
    }
  });
});
