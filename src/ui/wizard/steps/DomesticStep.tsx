import { useState, useEffect } from "react";
import type { Verdict } from "../../../contracts/responses";
import VerdictBadge from "../../components/VerdictBadge";
import type { WizardDispatch } from "../fsm";

const SPECIES_LABELS: Record<string, string> = {
  haliotis: "전복", rockfish: "조피볼락", flatfish: "가자미",
  seabream: "참돔", pollock: "명태", mackerel: "고등어",
  tuna: "참치", clam: "대합",
};
const METHOD_LABELS: Record<string, string> = {
  naejam: "나잠", yeonseung: "연승", jamang: "자망",
  troll: "트롤", jeongchimang: "정치망", yangshik: "양식",
};
const REGION_LABELS: Record<string, string> = {
  "east-sea": "동해", "west-sea": "서해", "south-sea": "남해",
  "WCPFC": "WCPFC 서중앙태평양", "IOTC": "IOTC 인도양",
  "IATTC": "IATTC 동태평양", "ICCAT": "ICCAT 대서양",
};

type LoffEntry = { species: string; method: string; region: string };
interface Props { dispatch: WizardDispatch; onNext: () => void }

function SelectColumn({
  step, title, options, labels, selected, onSelect, hint,
}: {
  step: string; title: string; options: string[]; labels: Record<string, string>;
  selected: string; onSelect: (v: string) => void; hint?: string;
}) {
  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white overflow-hidden min-h-52">
      <div className="border-b border-gray-100 bg-gray-50 px-3 py-2 shrink-0">
        <span className="text-xs font-semibold text-gray-400">{step}</span>
        <span className="ml-1.5 text-sm font-semibold text-gray-700">{title}</span>
      </div>
      <ul className="flex-1 overflow-y-auto p-1">
        {options.length === 0 ? (
          <li className="px-3 py-6 text-center text-xs text-gray-400">{hint ?? "항목 없음"}</li>
        ) : (
          options.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                onClick={() => onSelect(opt)}
                className={`w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                  selected === opt
                    ? "bg-blue-50 font-medium text-blue-700 ring-1 ring-inset ring-blue-200"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {labels[opt] ?? opt}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

const BLANK_VERDICT: Verdict = {
  kind: "conditional", message: "항목을 선택해 주세요.",
  missing: ["species", "method", "region"], nextStepEnabled: false,
};

export default function DomesticStep({ dispatch, onNext }: Props) {
  const [loff, setLoff] = useState<LoffEntry[]>([]);
  const [species, setSpecies] = useState("");
  const [method, setMethod] = useState("");
  const [region, setRegion] = useState("");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/rules")
      .then((r) => r.json() as Promise<{ loff: LoffEntry[] }>)
      .then((d) => setLoff(d.loff));
  }, []);

  const allSpecies = [...new Set(loff.map((r) => r.species))];
  const methodsFor = species
    ? [...new Set(loff.filter((r) => r.species === species).map((r) => r.method))]
    : [];
  const regionsFor =
    species && method
      ? loff.filter((r) => r.species === species && r.method === method).map((r) => r.region)
      : [];

  const pickSpecies = (v: string) => {
    setSpecies(v); setMethod(""); setRegion("");
    setVerdict(null); dispatch({ type: "VERDICT_UPDATE", verdict: BLANK_VERDICT });
  };
  const pickMethod = (v: string) => {
    setMethod(v); setRegion("");
    setVerdict(null); dispatch({ type: "VERDICT_UPDATE", verdict: BLANK_VERDICT });
  };

  useEffect(() => {
    if (!species || !method || !region) return;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/verify/domestic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ method, species, region }),
        });
        const data = (await res.json()) as Verdict;
        setVerdict(data);
        dispatch({ type: "VERDICT_UPDATE", verdict: data });
      } catch {
        setVerdict(null);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => { clearTimeout(t); setLoading(false); };
  }, [species, method, region, dispatch]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">국내산 어업 정보 입력</h2>

      <div className="grid grid-cols-3 gap-3">
        <SelectColumn
          step="①" title="어종"
          options={allSpecies} labels={SPECIES_LABELS}
          selected={species} onSelect={pickSpecies}
          hint="불러오는 중..."
        />
        <SelectColumn
          step="②" title="어법"
          options={methodsFor} labels={METHOD_LABELS}
          selected={method} onSelect={pickMethod}
          hint={species ? "해당 어종의 어법 없음" : "어종을 먼저 선택하세요"}
        />
        <SelectColumn
          step="③" title="해역"
          options={regionsFor} labels={REGION_LABELS}
          selected={region} onSelect={setRegion}
          hint={method ? "해당 조합의 해역 없음" : "어법을 먼저 선택하세요"}
        />
      </div>

      {loading && <p className="text-sm text-gray-400">검증 중...</p>}

      {!loading && verdict && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
          <div className="flex items-center gap-3">
            <VerdictBadge kind={verdict.kind} />
            {verdict.loffId && (
              <span className="font-mono text-xs text-gray-500">{verdict.loffId}</span>
            )}
            {verdict.matchedRuleId && (
              <span className="font-mono text-xs text-gray-400">({verdict.matchedRuleId})</span>
            )}
          </div>
          <p className="text-sm text-gray-700">{verdict.message}</p>
          {verdict.requiredDocs && verdict.requiredDocs.length > 0 && (
            <div className="pt-1">
              <p className="text-xs font-medium text-gray-600">필요 서류:</p>
              <ul className="mt-1 list-inside list-disc space-y-0.5">
                {verdict.requiredDocs.map((doc) => (
                  <li key={doc} className="text-xs text-gray-500">{doc}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

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
          disabled={!verdict?.nextStepEnabled}
          onClick={() => {
            dispatch({ type: "SET_FORM_DATA", data: { method, species, region } });
            onNext();
          }}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          다음 단계
        </button>
      </div>
    </div>
  );
}
