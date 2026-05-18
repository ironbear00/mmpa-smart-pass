type Status = "active" | "expired" | "future";

function getStatus(from: string, to: string | null, asOf: string): Status {
  if (asOf < from) return "future";
  if (to !== null && asOf > to) return "expired";
  return "active";
}

const BADGE: Record<Status, string> = {
  active:  "bg-green-100 text-green-700",
  expired: "bg-red-100 text-red-700",
  future:  "bg-gray-100 text-gray-500",
};
const BADGE_LABEL: Record<Status, string> = { active: "활성", expired: "만료", future: "미적용" };

const GRADE_STYLE: Record<string, string> = {
  L1: "bg-green-50 text-green-700 font-bold",
  L2: "bg-yellow-50 text-yellow-700 font-bold",
  L3: "bg-red-50 text-red-700 font-bold",
};

interface CoaCountryRule {
  id: string;
  countryCode: string;
  countryNm: string;
  listGrade: string;
  effectiveFrom: string;
  effectiveTo: string | null;
}

interface Props { rules: CoaCountryRule[]; asOf: string; }

export default function CoaCountryTable({ rules, asOf }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-xs">
        <thead className="bg-gray-50 text-left text-gray-500 uppercase tracking-wider">
          <tr>
            {["규칙ID", "코드", "국가명", "관리등급", "시작일", "종료일", "상태"].map((h) => (
              <th key={h} className="px-3 py-2">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {rules.map((r) => {
            const st = getStatus(r.effectiveFrom, r.effectiveTo, asOf);
            return (
              <tr key={r.id} className={st === "expired" ? "opacity-50" : ""}>
                <td className="px-3 py-2 font-mono text-gray-400">{r.id}</td>
                <td className="px-3 py-2 font-mono font-bold">{r.countryCode}</td>
                <td className="px-3 py-2">{r.countryNm}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-0.5 ${GRADE_STYLE[r.listGrade] ?? ""}`}>
                    {r.listGrade}
                  </span>
                </td>
                <td className="px-3 py-2 text-gray-500">{r.effectiveFrom}</td>
                <td className="px-3 py-2 text-gray-500">{r.effectiveTo ?? "–"}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-0.5 font-medium ${BADGE[st]}`}>
                    {BADGE_LABEL[st]}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
