import { useState, useEffect } from "react";
import LoffTable from "../components/ruleset/LoffTable";
import CoaCountryTable from "../components/ruleset/CoaCountryTable";
import CoaItemTable from "../components/ruleset/CoaItemTable";

interface RulesData {
  loff: {
    id: string; method: string; species: string; region: string;
    loffId: string; effectiveFrom: string; effectiveTo: string | null;
  }[];
  coaCountries: {
    id: string; countryCode: string; countryNm: string;
    listGrade: string; effectiveFrom: string; effectiveTo: string | null;
  }[];
  coaItems: {
    id: string; itemCd: string; itemNmKor: string; itemNmEng: string;
    scientificNm: string; hsk: string; allowedCountries: readonly string[];
  }[];
}

type Tab = "loff" | "coa_country" | "coa_item";

const TABS: { key: Tab; label: string }[] = [
  { key: "loff",        label: "LOFF 룰셋 (국내산)" },
  { key: "coa_country", label: "COA 국가 목록 (수입산)" },
  { key: "coa_item",    label: "COA 품목 목록" },
];

export default function RulesetPage() {
  const [data, setData] = useState<RulesData | null>(null);
  const [tab, setTab] = useState<Tab>("loff");
  const today = new Date().toISOString().slice(0, 10);
  const [asOf, setAsOf] = useState(today);

  useEffect(() => {
    fetch("/api/rules")
      .then((r) => r.json())
      .then((d) => setData(d as RulesData));
  }, []);

  if (!data) {
    return <p className="py-10 text-center text-sm text-gray-400">불러오는 중...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-800">룰셋 현황</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">기준 날짜</label>
          <input
            type="date"
            value={asOf}
            onChange={(e) => setAsOf(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {asOf !== today && (
            <button
              onClick={() => setAsOf(today)}
              className="text-xs text-blue-600 hover:underline"
            >
              오늘로
            </button>
          )}
        </div>
      </div>

      {asOf !== today && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm text-yellow-700">
          시뮬레이션 날짜: <strong>{asOf}</strong> 기준으로 표시 중. 룰셋 유효 기간이 이 날짜를 기준으로 계산됩니다.
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "loff"        && <LoffTable        rules={data.loff}         asOf={asOf} />}
      {tab === "coa_country" && <CoaCountryTable  rules={data.coaCountries} asOf={asOf} />}
      {tab === "coa_item"    && <CoaItemTable     items={data.coaItems} />}
    </div>
  );
}
