import { useState, useReducer } from "react";
import { wizardReducer, initialState } from "./wizard/fsm";
import BranchSelect from "./components/BranchSelect";
import DomesticStep from "./wizard/steps/DomesticStep";
import ImportStep from "./wizard/steps/ImportStep";
import UploadStep from "./wizard/steps/UploadStep";
import ReviewStep from "./wizard/steps/ReviewStep";
import VerdictBadge from "./components/VerdictBadge";
import HistoryPage from "./pages/HistoryPage";
import RulesetPage from "./pages/RulesetPage";

type Page = "wizard" | "history" | "ruleset";

const NAV: { key: Page; label: string }[] = [
  { key: "wizard",  label: "신청하기" },
  { key: "history", label: "신청 이력" },
  { key: "ruleset", label: "룰셋 현황" },
];

const STEP_ORDER = [
  "SELECT_TYPE", "INPUT_RULE", "VALIDATED",
  "UPLOAD_DOCS", "READY_TO_SUBMIT", "SUBMITTED",
] as const;

const STEP_LABELS: Record<(typeof STEP_ORDER)[number], string> = {
  SELECT_TYPE: "유형 선택", INPUT_RULE: "정보 입력", VALIDATED: "검증 완료",
  UPLOAD_DOCS: "서류 확인", READY_TO_SUBMIT: "최종 확인", SUBMITTED: "제출 완료",
};

export default function App() {
  const [page, setPage] = useState<Page>("wizard");
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  const stepIndex = STEP_ORDER.indexOf(state.step);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <div>
            <h1 className="text-base font-bold text-blue-700">MMPA Smart-Pass</h1>
            <p className="text-xs text-gray-400">수산물 수출확인증명 통합 신청 플랫폼</p>
          </div>
          <nav className="flex gap-1">
            {NAV.map((n) => (
              <button
                key={n.key}
                onClick={() => setPage(n.key)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                  page === n.key
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {n.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {page === "wizard" && (
        <div className="border-b border-gray-100 bg-white px-6 py-3">
          <div className="flex items-center gap-1 overflow-x-auto">
            {STEP_ORDER.map((stepKey, i) => (
              <div key={stepKey} className="flex shrink-0 items-center gap-1">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                  i < stepIndex ? "bg-blue-600 text-white"
                  : i === stepIndex ? "bg-blue-100 text-blue-700 ring-2 ring-blue-400"
                  : "bg-gray-100 text-gray-400"
                }`}>
                  {i < stepIndex ? "✓" : i + 1}
                </div>
                <span className={`hidden text-xs sm:block ${i === stepIndex ? "font-medium text-blue-700" : "text-gray-400"}`}>
                  {STEP_LABELS[stepKey]}
                </span>
                {i < STEP_ORDER.length - 1 && (
                  <div className={`h-px w-4 ${i < stepIndex ? "bg-blue-400" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-4xl px-4 py-8">
        {page === "history" && <HistoryPage />}
        {page === "ruleset" && <RulesetPage />}

        {page === "wizard" && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            {state.step === "SELECT_TYPE" && <BranchSelect dispatch={dispatch} />}

            {state.step === "INPUT_RULE" && state.branch === "domestic" && (
              <DomesticStep dispatch={dispatch} onNext={() => dispatch({ type: "NEXT" })} />
            )}
            {state.step === "INPUT_RULE" && state.branch === "import" && (
              <ImportStep dispatch={dispatch} onNext={() => dispatch({ type: "NEXT" })} />
            )}

            {state.step === "VALIDATED" && state.verdict && (
              <div className="space-y-6 py-4 text-center">
                <div className="text-5xl">✅</div>
                <h2 className="text-xl font-semibold text-gray-800">검증 완료</h2>
                <div className="flex justify-center"><VerdictBadge kind={state.verdict.kind} /></div>
                <p className="text-sm text-gray-600">{state.verdict.message}</p>
                {state.verdict.loffId && <p className="font-mono text-xs text-gray-400">LOFF ID: {state.verdict.loffId}</p>}
                {state.verdict.listGrade && <p className="text-xs text-gray-500">관리등급: {state.verdict.listGrade}</p>}
                <div className="flex justify-center gap-3 pt-2">
                  <button onClick={() => dispatch({ type: "BACK" })} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">수정</button>
                  <button onClick={() => dispatch({ type: "NEXT" })} className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">서류 확인 →</button>
                </div>
              </div>
            )}

            {state.step === "UPLOAD_DOCS"     && <UploadStep state={state} dispatch={dispatch} />}
            {state.step === "READY_TO_SUBMIT" && <ReviewStep state={state} dispatch={dispatch} />}

            {state.step === "SUBMITTED" && (
              <div className="space-y-4 py-10 text-center">
                <div className="text-5xl">🎉</div>
                <h2 className="text-xl font-semibold text-gray-800">제출 완료</h2>
                {state.docNo && (
                  <div className="inline-block rounded-lg border border-blue-200 bg-blue-50 px-4 py-2">
                    <p className="text-xs text-gray-500">접수번호</p>
                    <p className="font-mono text-lg font-bold text-blue-700">{state.docNo}</p>
                  </div>
                )}
                <p className="text-sm text-gray-500">신청서가 성공적으로 접수되었습니다.</p>
                <div className="flex justify-center gap-3 pt-2">
                  <button onClick={() => { dispatch({ type: "RESET" }); }} className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">새 신청서</button>
                  <button onClick={() => setPage("history")} className="rounded-lg border border-gray-300 px-6 py-2 text-sm text-gray-600 hover:bg-gray-50">이력 보기</button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
