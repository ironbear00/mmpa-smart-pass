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

export interface ItemEntry {
  id: string;
  input: Record<string, string>;
  verdict: Verdict;
}

export interface WizardState {
  step: WizardStep;
  branch: Branch | null;
  items: ItemEntry[];
  docNo: string | null;
}

export type WizardAction =
  | { type: "SELECT_BRANCH"; branch: Branch }
  | { type: "ITEM_UPSERT"; item: ItemEntry }
  | { type: "ITEM_REMOVE"; id: string }
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
  items: [],
  docNo: null,
};

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SELECT_BRANCH":
      return { ...state, step: "INPUT_RULE", branch: action.branch, items: [] };

    case "ITEM_UPSERT": {
      const exists = state.items.some((i) => i.id === action.item.id);
      const items = exists
        ? state.items.map((i) => (i.id === action.item.id ? action.item : i))
        : [...state.items, action.item];
      return { ...state, items };
    }

    case "ITEM_REMOVE":
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };

    case "NEXT": {
      const idx = STEP_ORDER.indexOf(state.step);
      if (idx === -1 || idx === STEP_ORDER.length - 1) return state;
      if (
        state.step === "INPUT_RULE" &&
        (state.items.length === 0 || !state.items.every((i) => i.verdict.nextStepEnabled))
      ) return state;
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
