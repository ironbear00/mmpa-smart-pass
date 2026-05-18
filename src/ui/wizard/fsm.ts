import type { Verdict } from "../../contracts/responses";
import type { Dispatch } from "react";

export type WizardStep =
  | "SELECT_TYPE"
  | "INPUT_RULE"
  | "VALIDATED"
  | "UPLOAD_DOCS"
  | "READY_TO_SUBMIT"
  | "SUBMITTED";

export type Branch = "domestic" | "import";

export interface WizardState {
  step: WizardStep;
  branch: Branch | null;
  verdict: Verdict | null;
  formData: Record<string, string>;
  docNo: string | null;
}

export type WizardAction =
  | { type: "SELECT_BRANCH"; branch: Branch }
  | { type: "VERDICT_UPDATE"; verdict: Verdict }
  | { type: "SET_FORM_DATA"; data: Record<string, string> }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "SUBMIT_SUCCESS"; docNo: string }
  | { type: "RESET" };

export type WizardDispatch = Dispatch<WizardAction>;

const STEP_ORDER: WizardStep[] = [
  "SELECT_TYPE",
  "INPUT_RULE",
  "VALIDATED",
  "UPLOAD_DOCS",
  "READY_TO_SUBMIT",
  "SUBMITTED",
];

export const initialState: WizardState = {
  step: "SELECT_TYPE",
  branch: null,
  verdict: null,
  formData: {},
  docNo: null,
};

export function wizardReducer(
  state: WizardState,
  action: WizardAction
): WizardState {
  switch (action.type) {
    case "SELECT_BRANCH":
      return { ...state, step: "INPUT_RULE", branch: action.branch, verdict: null, formData: {} };

    case "VERDICT_UPDATE":
      return { ...state, verdict: action.verdict };

    case "SET_FORM_DATA":
      return { ...state, formData: action.data };

    case "NEXT": {
      const idx = STEP_ORDER.indexOf(state.step);
      if (idx === -1 || idx === STEP_ORDER.length - 1) return state;
      if (state.step === "INPUT_RULE" && !state.verdict?.nextStepEnabled) return state;
      return { ...state, step: STEP_ORDER[idx + 1] };
    }

    case "BACK": {
      const idx = STEP_ORDER.indexOf(state.step);
      if (idx <= 0) return state;
      return { ...state, step: STEP_ORDER[idx - 1] };
    }

    case "SUBMIT_SUCCESS":
      return { ...state, step: "SUBMITTED", docNo: action.docNo };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}
