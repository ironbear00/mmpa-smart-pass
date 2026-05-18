import type { Branch, WizardDispatch } from "../wizard/fsm";

const BRANCHES: { value: Branch; label: string; desc: string; icon: string }[] = [
  {
    value: "domestic",
    label: "국내산",
    desc: "국내 어업·양식 수산물 (LOFF 확인)",
    icon: "🇰🇷",
  },
  {
    value: "import",
    label: "수입산",
    desc: "해외 원산지 수입 수산물 (COA 확인)",
    icon: "🌐",
  },
];

interface Props {
  dispatch: WizardDispatch;
}

export default function BranchSelect({ dispatch }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">원산지 구분 선택</h2>
      <p className="text-sm text-gray-500">신청할 수산물의 원산지를 선택하세요.</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {BRANCHES.map((b) => (
          <button
            key={b.value}
            onClick={() => dispatch({ type: "SELECT_BRANCH", branch: b.value })}
            className="flex flex-col items-start gap-3 rounded-xl border-2 border-gray-200 p-6 text-left transition-all hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <span className="text-4xl">{b.icon}</span>
            <span className="text-lg font-bold text-gray-900">{b.label}</span>
            <span className="text-sm text-gray-500">{b.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
