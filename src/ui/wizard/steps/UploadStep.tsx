import { useState } from "react";
import type { WizardDispatch, WizardState } from "../fsm";

interface Props {
  state: WizardState;
  dispatch: WizardDispatch;
}

export default function UploadStep({ state, dispatch }: Props) {
  const docs = state.verdict?.requiredDocs ?? [];
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(docs.map((d) => [d, false]))
  );

  const allChecked = docs.length === 0 || docs.every((d) => checked[d]);

  const toggle = (doc: string) =>
    setChecked((prev) => ({ ...prev, [doc]: !prev[doc] }));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">필수 서류 확인</h2>

      {docs.length === 0 ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-700">이 신청에는 별도 첨부 서류가 없습니다.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-gray-600">아래 서류를 모두 확인·준비한 후 다음 단계로 진행하세요.</p>
            {state.verdict?.documentTrack === "catch_certificate" && (
              <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">어획증명서 트랙</span>
            )}
            {state.verdict?.documentTrack === "coa" && (
              <span className="rounded bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-600">COA 트랙</span>
            )}
          </div>
          <ul className="space-y-2">
            {docs.map((doc) => (
              <li key={doc}>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={!!checked[doc]}
                    onChange={() => toggle(doc)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`text-sm ${checked[doc] ? "text-gray-400 line-through" : "text-gray-800"}`}>
                    {doc}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-gray-400">
        ※ 실제 파일 업로드는 정식 시스템에서 처리됩니다. 이 화면은 PoC 시연용입니다.
      </p>

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={() => dispatch({ type: "BACK" })}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          이전
        </button>
        <button
          type="button"
          disabled={!allChecked}
          onClick={() => dispatch({ type: "NEXT" })}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          다음 단계
        </button>
      </div>
    </div>
  );
}
