import { useState } from "react";
import VerdictBadge from "../../components/VerdictBadge";
import type { WizardDispatch, WizardState } from "../fsm";

const DOMESTIC_LABELS: Record<string, string> = {
  naejam: "나잠", yeonseung: "연승", jamang: "자망",
  troll: "트롤", jeongchimang: "정치망", yangshik: "양식",
  haliotis: "전복", rockfish: "조피볼락", flatfish: "가자미",
  seabream: "참돔", pollock: "명태", mackerel: "고등어",
  tuna: "참치", clam: "대합",
  "east-sea": "동해", "west-sea": "서해", "south-sea": "남해",
  "WCPFC": "WCPFC (서중앙태평양)", "IOTC": "IOTC (인도양)",
  "IATTC": "IATTC (동태평양)", "ICCAT": "ICCAT (대서양)",
};

const ITEM_LABELS: Record<string, string> = {
  "ITEM-SAL": "연어", "ITEM-COD": "대구", "ITEM-SHR": "새우",
  "ITEM-OCT": "문어", "ITEM-TUN": "참치",
};

interface Props {
  state: WizardState;
  dispatch: WizardDispatch;
}

export default function ReviewStep({ state, dispatch }: Props) {
  const [applicantNm, setApplicantNm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDomestic = state.branch === "domestic";

  const handleSubmit = async () => {
    if (!applicantNm.trim()) {
      setError("신청인 이름을 입력해 주세요.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/applications/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branch: state.branch,
          applicantNm: applicantNm.trim(),
          formData: state.formData,
          verdict: state.verdict,
        }),
      });
      if (!res.ok) {
        const data = await res.json() as { error: unknown };
        throw new Error(String(data.error ?? "제출 실패"));
      }
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
        {/* Branch */}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-gray-500">원산지 구분</span>
          <span className="text-sm font-medium">{isDomestic ? "국내산" : "수입산"}</span>
        </div>

        {/* Form data */}
        {isDomestic ? (
          <>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-500">어업 방법</span>
              <span className="text-sm font-medium">
                {DOMESTIC_LABELS[state.formData.method] ?? state.formData.method}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-500">어종</span>
              <span className="text-sm font-medium">
                {DOMESTIC_LABELS[state.formData.species] ?? state.formData.species}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-500">어획 지역</span>
              <span className="text-sm font-medium">
                {DOMESTIC_LABELS[state.formData.region] ?? state.formData.region}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-500">원산지 국가</span>
              <span className="text-sm font-medium">{state.formData.countryCode}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-500">품목</span>
              <span className="text-sm font-medium">
                {ITEM_LABELS[state.formData.itemCd] ?? state.formData.itemCd}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-500">가공국</span>
              <span className="text-sm font-medium">{state.formData.processingCountry}</span>
            </div>
          </>
        )}

        {/* Verdict */}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-gray-500">검증 결과</span>
          {state.verdict && <VerdictBadge kind={state.verdict.kind} />}
        </div>

        {state.verdict?.loffId && (
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-500">LOFF ID</span>
            <span className="font-mono text-sm">{state.verdict.loffId}</span>
          </div>
        )}

        {state.verdict?.listGrade && (
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-500">관리등급</span>
            <span className="text-sm font-medium">{state.verdict.listGrade}</span>
          </div>
        )}
      </div>

      {/* Applicant name */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          신청인 성명 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={applicantNm}
          onChange={(e) => setApplicantNm(e.target.value)}
          placeholder="홍길동"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={() => dispatch({ type: "BACK" })}
          disabled={submitting}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        >
          이전
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={handleSubmit}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "제출 중..." : "신청서 제출"}
        </button>
      </div>
    </div>
  );
}
