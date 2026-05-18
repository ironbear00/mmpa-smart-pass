import type { ListGrade } from "../rules/schema";

export type VerdictKind =
  | "eligible"     // 조합 확정
  | "ineligible"   // 룰셋에 없는 조합 (반려 사유 명시)
  | "conditional"  // 추가 입력/서류 필요 (missing 명시)
  | "unknown";     // 룰셋 미수록 (수동 검토 필요)

// L1·USA → catch_certificate, L2·L3(fisheryExemption) → coa
export type DocumentTrack = "catch_certificate" | "coa";

export interface Verdict {
  kind: VerdictKind;
  loffId?: string;
  listGrade?: ListGrade;
  documentTrack?: DocumentTrack;   // 수입산 eligible 시 결정
  message: string;                 // 한국어 자연어
  missing?: string[];              // conditional 시 필요 항목
  requiredDocs?: string[];         // eligible 시 필요 서류
  matchedRuleId?: string;          // 감사 추적
  nextStepEnabled: boolean;        // FSM 전이 가능 여부
}
