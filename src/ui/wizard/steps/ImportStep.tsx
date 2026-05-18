import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import type { Verdict } from "../../../contracts/responses";
import VerdictBadge from "../../components/VerdictBadge";
import type { WizardDispatch } from "../fsm";

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
  { value: "ITEM-SAL",     label: "연어 (원물)",          defaultProcessingCountry: null },
  { value: "ITEM-COD",     label: "대구 (원물)",          defaultProcessingCountry: null },
  { value: "ITEM-SHR",     label: "새우 (원물)",          defaultProcessingCountry: null },
  { value: "ITEM-OCT",     label: "문어 (원물)",          defaultProcessingCountry: null },
  { value: "ITEM-TUN",     label: "참치 (원물)",          defaultProcessingCountry: null },
  { value: "ITEM-MAC-CAN", label: "고등어 캔",            defaultProcessingCountry: "KOR" },
  { value: "ITEM-TUN-CAN", label: "참치 캔",              defaultProcessingCountry: "KOR" },
  { value: "ITEM-SHR-FRZ", label: "냉동 새우 가공품",     defaultProcessingCountry: "KOR" },
];

type FormValues = { countryCode: string; itemCd: string };

interface Props {
  dispatch: WizardDispatch;
  onNext: () => void;
}

export default function ImportStep({ dispatch, onNext }: Props) {
  const { register, watch } = useForm<FormValues>({
    defaultValues: { countryCode: "", itemCd: "" },
  });
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [loading, setLoading] = useState(false);
  const [fisheryExemption, setFisheryExemption] = useState(false);

  const values = watch();
  const isL3 = verdict?.listGrade === "L3";

  useEffect(() => {
    if (!isL3) setFisheryExemption(false);
  }, [isL3]);

  useEffect(() => {
    const body: Record<string, unknown> = {};
    if (values.countryCode) body.countryCode = values.countryCode;
    if (values.itemCd)      body.itemCd      = values.itemCd;
    if (isL3)               body.fisheryExemption = fisheryExemption;

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/verify/coa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
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

    return () => { clearTimeout(timer); setLoading(false); };
  }, [values.countryCode, values.itemCd, fisheryExemption, isL3, dispatch]);

  const selectClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  const GRADE_COLORS: Record<string, string> = {
    L1: "text-green-700 font-medium",
    L2: "text-yellow-700 font-medium",
    L3: "text-red-700 font-medium",
  };

  const TRACK_LABEL: Record<string, string> = {
    catch_certificate: "어획증명서 트랙",
    coa: "COA 트랙",
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">수입산 원산지 정보 입력</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">원산지 국가</label>
          <select {...register("countryCode")} className={selectClass}>
            <option value="">선택하세요</option>
            {COUNTRIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <p className="text-xs text-gray-400">* 만료된 국가 — 미확인 결과</p>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">품목</label>
          <select {...register("itemCd")} className={selectClass}>
            <option value="">선택하세요</option>
            {ITEMS.map((i) => (
              <option key={i.value} value={i.value}>{i.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* L3 경고 + 미적용 어업 체크박스 */}
      {isL3 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-red-500">⚠️</span>
            <p className="text-sm text-red-700 font-medium">
              L3 등급 국가 — 원칙적으로 수입 금지 대상입니다.
            </p>
          </div>
          <p className="text-xs text-red-600">
            MMPA(Marine Mammal Protection Act) 미적용 어업에서 생산된 경우에 한하여 COA 제출 후 신청 가능합니다.
          </p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={fisheryExemption}
              onChange={(e) => setFisheryExemption(e.target.checked)}
              className="h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm font-medium text-red-800">
              MMPA 미적용 어업에서 생산된 수산물임을 확인합니다
            </span>
          </label>
        </div>
      )}

      {loading && <p className="text-sm text-gray-400">검증 중...</p>}

      {!loading && verdict && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <VerdictBadge kind={verdict.kind} />
            {verdict.listGrade && (
              <span className={`text-sm ${GRADE_COLORS[verdict.listGrade] ?? ""}`}>
                관리등급 {verdict.listGrade}
              </span>
            )}
            {verdict.documentTrack && (
              <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                {TRACK_LABEL[verdict.documentTrack]}
              </span>
            )}
            {verdict.matchedRuleId && (
              <span className="font-mono text-xs text-gray-400">({verdict.matchedRuleId})</span>
            )}
          </div>
          <p className="text-sm text-gray-700">{verdict.message}</p>
          {verdict.missing && verdict.missing.length > 0 && (
            <p className="text-xs text-yellow-700">필요 항목: {verdict.missing.join(", ")}</p>
          )}
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
            const selectedItem = ITEMS.find((i) => i.value === values.itemCd);
            dispatch({
              type: "SET_FORM_DATA",
              data: {
                countryCode: values.countryCode,
                itemCd: values.itemCd,
                processingCountry: selectedItem?.defaultProcessingCountry ?? "",
                fisheryExemption: String(fisheryExemption),
              },
            });
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
