import { useState } from "react";
import VerdictBadge from "../../components/VerdictBadge";
import type { WizardDispatch, WizardState } from "../fsm";

const LABELS: Record<string, string> = {
  naejam: "나잠", yeonseung: "연승", jamang: "자망",
  troll: "트롤", jeongchimang: "정치망", yangshik: "양식",
  haliotis: "전복", rockfish: "조피볼락", flatfish: "가자미",
  seabream: "참돔", pollock: "명태", mackerel: "고등어",
  tuna: "참치", clam: "대합",
  "east-sea": "동해", "west-sea": "서해", "south-sea": "남해",
  "WCPFC": "WCPFC (서중앙태평양)", "IOTC": "IOTC (인도양)",
  "IATTC": "IATTC (동태평양)", "ICCAT": "ICCAT (대서양)",
  "ITEM-SAL": "연어", "ITEM-COD": "대구", "ITEM-SHR": "새우",
  "ITEM-OCT": "문어", "ITEM-TUN": "참치", "ITEM-MAC-CAN": "고등어 캔",
  "ITEM-TUN-CAN": "참치 캔", "ITEM-SHR-FRZ": "냉동 새우 가공품",
};

interface Props { state: WizardState; dispatch: WizardDispatch }

export default function ReviewStep({ state, dispatch }: Props) {
  const [applicantNm, setApplicantNm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDomestic = state.branch === "domestic";

  const handleSubmit = async () => {
    if (!applicantNm.trim()) { setError("신청인 이름을 입력해 주세요."); return; }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/applications/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch: state.branch, applicantNm: applicantNm.trim(), items: state.items }),
      });
      if (!res.ok) { const d = await res.json() as { error: unknown }; throw new Error(String(d.error ?? "제출 실패")); }
      const { docNo } = await res.json() as { docNo: string };
      dispatch({ type: "SUBMIT_SUCCESS", docNo });
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">제출 전 최종 확인</h2>

      <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-gray-500">원산지 구분</span>
          <span className="text-sm font-medium">{isDomestic ? "국내산" : "수입산"}</span>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-gray-500">신청 항목 수</span>
          <span className="text-sm font-medium">{state.items.length}건</span>
        </div>
      </div>

      <div className="space-y-2">
        {state.items.map((item, idx) => (
          <div key={item.id} className="rounded-lg border border-gray-200 divide-y divide-gray-100">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50">
              <span className="text-xs font-semibold text-gray-500">항목 #{idx + 1}</span>
              <VerdictBadge kind={item.verdict.kind} />
            </div>
            {isDomestic ? (
              <>
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm text-gray-500">어종 · 어법 · 해역</span>
                  <span className="text-sm font-medium">
                    {LABELS[item.input.species]} · {LABELS[item.input.method]} · {LABELS[item.input.region]}
                  </span>
                </div>
                {item.verdict.loffId && (
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-sm text-gray-500">LOFF ID</span>
                    <span className="font-mono text-sm">{item.verdict.loffId}</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm text-gray-500">국가 · 품목</span>
                  <span className="text-sm font-medium">
                    {item.input.countryCode} · {LABELS[item.input.itemCd] ?? item.input.itemCd}
                  </span>
                </div>
                {item.verdict.listGrade && (
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-sm text-gray-500">관리등급</span>
                    <span className="text-sm font-medium">{item.verdict.listGrade}</span>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">신청인 성명 <span className="text-red-500">*</span></label>
        <input type="text" value={applicantNm} onChange={(e) => setApplicantNm(e.target.value)}
          placeholder="홍길동"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-between pt-2">
        <button type="button" onClick={() => dispatch({ type: "BACK" })} disabled={submitting}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">이전</button>
        <button type="button" disabled={submitting} onClick={handleSubmit}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? "제출 중..." : "신청서 제출"}
        </button>
      </div>
    </div>
  );
}
