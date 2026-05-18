import { describe, it, expect } from "vitest";
import { verifyCoa } from "../src/engine/coa";
import type { CoaInput } from "../src/engine/coa";
import cases from "./fixtures/coa-cases.json";

type ExpectedVerdict = {
  kind: string;
  nextStepEnabled: boolean;
  listGrade?: string;
  documentTrack?: string;
  matchedRuleId?: string;
  missing?: string[];
};

describe("verifyCoa", () => {
  it.each(cases)("$id: $description", ({ input, asOf, expectedVerdict }) => {
    const result = verifyCoa(input as Partial<CoaInput>, new Date(asOf));
    const expected = expectedVerdict as ExpectedVerdict;

    expect(result.kind).toBe(expected.kind);
    expect(result.nextStepEnabled).toBe(expected.nextStepEnabled);

    if (expected.listGrade !== undefined) {
      expect(result.listGrade).toBe(expected.listGrade);
    }
    if (expected.documentTrack !== undefined) {
      expect(result.documentTrack).toBe(expected.documentTrack);
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
