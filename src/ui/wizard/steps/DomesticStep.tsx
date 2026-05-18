import { useState, useEffect } from "react";
import type { Verdict } from "../../../contracts/responses";
import VerdictBadge from "../../components/VerdictBadge";
import type { WizardDispatch, WizardState } from "../fsm";

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

function SelectColumn({ step, title, options, labels, selected, onSelect, hint }: {
  step: string; title: string; options: string[]; labels: Record<string, string>;
  selected: string; onSelect: (v: string) => void; hint?: string;
}) {
  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white overflow-hidden min-h-44">
      <div className="border-b border-gray-100 bg-gray-50 px-3 py-2 shrink-0">
        <span className="text-xs font-semibold text-gray-400">{step}</span>
        <span className="ml-1.5 text-sm font-semibold text-gray-700">{title}</span>
      </div>
      <ul className="flex-1 overflow-y-auto p-1">
        {options.length === 0
          ? <li className="px-3 py-4 text-center text-xs text-gray-400">{hint ?? "항목 없음"}</li>
          : options.map((opt) => (
            <li key={opt}>
              <button type="button" onClick={() => onSelect(opt)}
                className={`w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                  selected === opt
                    ? "bg-blue-50 font-medium text-blue-700 ring-1 ring-inset ring-blue-200"
                    : "text-gray-700 hover:bg-gray-50"
                }`}>
                {labels[opt] ?? opt}
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
}

interface Props { state: WizardState; dispatch: WizardDispatch; onNext: () => void }

export default function DomesticStep({ state, dispatch, onNext }: Props) {
  const [loff, setLoff] = useState<LoffEntry[]>([]);
  const [species, setSpecies] = useState("");
  const [method, setMethod] = useState("");
  const [region, setRegion] = useState("");
  const [draftVerdict, setDraftVerdict] = useState<Verdict | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/rules")
      .then((r) => r.json() as Promise<{ loff: LoffEntry[] }>)
      .then((d) => setLoff(d.loff));
  }, []);

  const pickSpecies = (v: string) => { setSpecies(v); setMethod(""); setRegion(""); setDraftVerdict(null); };
  const pickMethod = (v: string) => { setMethod(v); setRegion(""); setDraftVerdict(null); };

  useEffect(() => {
    if (!species || !method || !region) return;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/verify/domestic", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ method, species, region }),
        });
        setDraftVerdict(await res.json() as Verdict);
      } catch { setDraftVerdict(null); }
      finally { setLoading(false); }
    }, 300);
    return () => { clearTimeout(t); setLoading(false); };
  }, [species, method, region]);

  const addItem = () => {
    if (!draftVerdict?.nextStepEnabled) return;
    dispatch({ type: "ITEM_UPSERT", item: { id: crypto.randomUUID(), input: { method, species, region }, verdict: draftVerdict } });
    setSpecies(""); setMethod(""); setRegion(""); setDraftVerdict(null);
  };

  const allSpecies = [...new Set(loff.map((r) => r.species))];
  const methodsFor = species ? [...new Set(loff.filter((r) => r.species === species).map((r) => r.method))] : [];
  const regionsFor = species && method ? loff.filter((r) => r.species === species && r.method === method).map((r) => r.region) : [];
  const allEligible = state.items.length > 0 && state.items.every((i) => i.verdict.nextStepEnabled);

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-gray-800">국내산 어업 정보 입력</h2>

      {state.items.length > 0 && (
        <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
          {state.items.map((item, idx) => (
            <div key={item.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-400">#{idx + 1}</span>
                <span className="text-sm text-gray-700">
                  {SPECIES_LABELS[item.input.species]} · {METHOD_LABELS[item.input.method]} · {REGION_LABELS[item.input.region]}
                </span>
                <VerdictBadge kind={item.verdict.kind} />
                {item.verdict.loffId && <span className="font-mono text-xs text-gray-400">{item.verdict.loffId}</span>}
              </div>
              <button type="button" onClick={() => dispatch({ type: "ITEM_REMOVE", id: item.id })}
                className="text-xs text-gray-300 hover:text-red-500">✕</button>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-dashed border-gray-300 p-4 space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">항목 추가</p>
        <div className="grid grid-cols-3 gap-3">
          <SelectColumn step="①" title="어종" options={allSpecies} labels={SPECIES_LABELS} selected={species} onSelect={pickSpecies} hint="불러오는 중..." />
          <SelectColumn step="②" title="어법" options={methodsFor} labels={METHOD_LABELS} selected={method} onSelect={pickMethod} hint={species ? "해당 어종의 어법 없음" : "어종을 먼저 선택하세요"} />
          <SelectColumn step="③" title="해역" options={regionsFor} labels={REGION_LABELS} selected={region} onSelect={setRegion} hint={method ? "해당 조합의 해역 없음" : "어법을 먼저 선택하세요"} />
        </div>
        {loading && <p className="text-sm text-gray-400">검증 중...</p>}
        {!loading && draftVerdict && (
          <div className="flex items-center gap-3">
            <VerdictBadge kind={draftVerdict.kind} />
            <p className="text-sm text-gray-600">{draftVerdict.message}</p>
          </div>
        )}
        <div className="flex justify-end">
          <button type="button" disabled={!draftVerdict?.nextStepEnabled} onClick={addItem}
            className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40">
            + 항목 추가
          </button>
        </div>
      </div>

      <div className="flex justify-between pt-1">
        <button type="button" onClick={() => dispatch({ type: "BACK" })}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">이전</button>
        <button type="button" disabled={!allEligible} onClick={onNext}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40">
          다음 단계
        </button>
      </div>
    </div>
  );
}
