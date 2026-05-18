import { useState, useEffect } from "react";
import type { Verdict } from "../../../contracts/responses";
import VerdictBadge from "../../components/VerdictBadge";
import type { WizardDispatch, WizardState } from "../fsm";

const COUNTRIES = [
  { value: "NOR", label: "노르웨이 (NOR)", grade: "L1" },
  { value: "ISL", label: "아이슬란드 (ISL)", grade: "L1" },
  { value: "CAN", label: "캐나다 (CAN)", grade: "L1" },
  { value: "AUS", label: "호주 (AUS)", grade: "L1" },
  { value: "NZL", label: "뉴질랜드 (NZL)", grade: "L1" },
  { value: "GBR", label: "영국 (GBR)", grade: "L1" },
  { value: "JPN", label: "일본 (JPN)", grade: "L1" },
  { value: "USA", label: "미국 (USA)", grade: "L1" },
  { value: "CHL", label: "칠레 (CHL)", grade: "L2" },
  { value: "PER", label: "페루 (PER)", grade: "L2" },
  { value: "MAR", label: "모로코 (MAR)", grade: "L2" },
  { value: "THA", label: "태국 (THA)", grade: "L2" },
  { value: "IDN", label: "인도네시아 (IDN)", grade: "L2" },
  { value: "ARG", label: "아르헨티나 (ARG)", grade: "L2" },
  { value: "CHN", label: "중국 (CHN)", grade: "L3" },
  { value: "VNM", label: "베트남 (VNM)", grade: "L3" },
  { value: "IND", label: "인도 (IND)", grade: "L3" },
  { value: "BGD", label: "방글라데시 (BGD)", grade: "L3" },
  { value: "MMR", label: "미얀마 (MMR) *", grade: "L3" },
  { value: "KHM", label: "캄보디아 (KHM) *", grade: "L3" },
];

const ITEMS = [
  { value: "ITEM-SAL",     label: "연어 (원물)",       defaultProcessingCountry: null },
  { value: "ITEM-COD",     label: "대구 (원물)",       defaultProcessingCountry: null },
  { value: "ITEM-SHR",     label: "새우 (원물)",       defaultProcessingCountry: null },
  { value: "ITEM-OCT",     label: "문어 (원물)",       defaultProcessingCountry: null },
  { value: "ITEM-TUN",     label: "참치 (원물)",       defaultProcessingCountry: null },
  { value: "ITEM-MAC-CAN", label: "고등어 캔",         defaultProcessingCountry: "KOR" },
  { value: "ITEM-TUN-CAN", label: "참치 캔",           defaultProcessingCountry: "KOR" },
  { value: "ITEM-SHR-FRZ", label: "냉동 새우 가공품", defaultProcessingCountry: "KOR" },
];

const GRADE_COLORS: Record<string, string> = {
  L1: "text-green-700", L2: "text-yellow-700", L3: "text-red-700",
};

const selectClass = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

interface Props { state: WizardState; dispatch: WizardDispatch; onNext: () => void }

export default function ImportStep({ state, dispatch, onNext }: Props) {
  const [countryCode, setCountryCode] = useState("");
  const [itemCd, setItemCd] = useState("");
  const [fisheryExemption, setFisheryExemption] = useState(false);
  const [draftVerdict, setDraftVerdict] = useState<Verdict | null>(null);
  const [loading, setLoading] = useState(false);

  const isL3 = draftVerdict?.listGrade === "L3";
  useEffect(() => { if (!isL3) setFisheryExemption(false); }, [isL3]);

  useEffect(() => {
    const body: Record<string, unknown> = {};
    if (countryCode) body.countryCode = countryCode;
    if (itemCd)      body.itemCd = itemCd;
    if (isL3)        body.fisheryExemption = fisheryExemption;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/verify/coa", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        setDraftVerdict(await res.json() as Verdict);
      } catch { setDraftVerdict(null); }
      finally { setLoading(false); }
    }, 300);
    return () => { clearTimeout(t); setLoading(false); };
  }, [countryCode, itemCd, fisheryExemption, isL3]);

  const addItem = () => {
    if (!draftVerdict?.nextStepEnabled) return;
    const selectedItem = ITEMS.find((i) => i.value === itemCd);
    dispatch({
      type: "ITEM_UPSERT",
      item: {
        id: crypto.randomUUID(),
        input: { countryCode, itemCd, processingCountry: selectedItem?.defaultProcessingCountry ?? "", fisheryExemption: String(fisheryExemption) },
        verdict: draftVerdict,
      },
    });
    setCountryCode(""); setItemCd(""); setFisheryExemption(false); setDraftVerdict(null);
  };

  const allEligible = state.items.length > 0 && state.items.every((i) => i.verdict.nextStepEnabled);

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-gray-800">수입산 원산지 정보 입력</h2>

      {state.items.length > 0 && (
        <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
          {state.items.map((item, idx) => {
            const countryLabel = COUNTRIES.find((c) => c.value === item.input.countryCode)?.label ?? item.input.countryCode;
            const itemLabel = ITEMS.find((i) => i.value === item.input.itemCd)?.label ?? item.input.itemCd;
            return (
              <div key={item.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-medium text-gray-400">#{idx + 1}</span>
                  <span className="text-sm text-gray-700">{countryLabel} · {itemLabel}</span>
                  {item.verdict.listGrade && (
                    <span className={`text-xs font-medium ${GRADE_COLORS[item.verdict.listGrade] ?? ""}`}>{item.verdict.listGrade}</span>
                  )}
                  <VerdictBadge kind={item.verdict.kind} />
                </div>
                <button type="button" onClick={() => dispatch({ type: "ITEM_REMOVE", id: item.id })}
                  className="text-xs text-gray-300 hover:text-red-500">✕</button>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-lg border border-dashed border-gray-300 p-4 space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">항목 추가</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">원산지 국가</label>
            <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className={selectClass}>
              <option value="">선택하세요</option>
              {COUNTRIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">품목</label>
            <select value={itemCd} onChange={(e) => setItemCd(e.target.value)} className={selectClass}>
              <option value="">선택하세요</option>
              {ITEMS.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
            </select>
          </div>
        </div>

        {isL3 && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-2">
            <p className="text-sm text-red-700 font-medium">⚠️ L3 등급 — 원칙적으로 수입 금지 대상입니다.</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={fisheryExemption} onChange={(e) => setFisheryExemption(e.target.checked)}
                className="h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500" />
              <span className="text-sm text-red-800">MMPA 미적용 어업 생산 수산물임을 확인합니다</span>
            </label>
          </div>
        )}

        {loading && <p className="text-sm text-gray-400">검증 중...</p>}
        {!loading && draftVerdict && (
          <div className="flex items-center gap-3 flex-wrap">
            <VerdictBadge kind={draftVerdict.kind} />
            {draftVerdict.listGrade && <span className={`text-sm font-medium ${GRADE_COLORS[draftVerdict.listGrade] ?? ""}`}>관리등급 {draftVerdict.listGrade}</span>}
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
