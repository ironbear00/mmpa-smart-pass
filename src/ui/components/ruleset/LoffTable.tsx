const M: Record<string, string> = {
  naejam: "나잠", yeonseung: "연승", jamang: "자망",
  troll: "트롤", jeongchimang: "정치망", yangshik: "양식",
};
const S: Record<string, string> = {
  haliotis: "전복", rockfish: "조피볼락", flatfish: "가자미",
  seabream: "참돔", pollock: "명태", mackerel: "고등어",
  tuna: "참치", clam: "대합",
};
const R: Record<string, string> = {
  "east-sea": "동해", "west-sea": "서해", "south-sea": "남해",
  "WCPFC": "WCPFC", "IOTC": "IOTC", "IATTC": "IATTC", "ICCAT": "ICCAT",
};

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

interface LoffRule {
  id: string;
  method: string;
  species: string;
  region: string;
  loffId: string;
  effectiveFrom: string;
  effectiveTo: string | null;
}

interface Props { rules: LoffRule[]; asOf: string; }

export default function LoffTable({ rules, asOf }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-xs">
        <thead className="bg-gray-50 text-left text-gray-500 uppercase tracking-wider">
          <tr>
            {["규칙ID", "어법", "어종", "해역", "LOFF ID", "시작일", "종료일", "상태"].map((h) => (
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
                <td className="px-3 py-2">{M[r.method] ?? r.method}</td>
                <td className="px-3 py-2">{S[r.species] ?? r.species}</td>
                <td className="px-3 py-2">{R[r.region] ?? r.region}</td>
                <td className="px-3 py-2 font-mono text-blue-600">{r.loffId}</td>
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
