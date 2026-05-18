import { useState, useEffect } from "react";

interface AppRow {
  id: number;
  doc_no: string;
  origin_type: "domestic" | "import";
  applicant_nm: string;
  applicant_dt: string;
  status: string;
  reg_dt: string;
}

const ORIGIN_LABEL: Record<string, string> = {
  domestic: "국내산",
  import: "수입산",
};

const STATUS_STYLE: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-700",
  draft:     "bg-gray-100 text-gray-500",
  rejected:  "bg-red-100 text-red-700",
};

export default function HistoryPage() {
  const [rows, setRows] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/applications")
      .then((r) => r.json())
      .then((data) => setRows(data as AppRow[]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="py-10 text-center text-sm text-gray-400">불러오는 중...</p>;
  }

  if (rows.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-400">아직 제출된 신청서가 없습니다.</p>
        <p className="mt-1 text-sm text-gray-300">신청하기 탭에서 첫 신청서를 작성하세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">신청 이력</h2>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">접수번호</th>
              <th className="px-4 py-3">구분</th>
              <th className="px-4 py-3">신청인</th>
              <th className="px-4 py-3">신청일</th>
              <th className="px-4 py-3">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-blue-600">{r.doc_no}</td>
                <td className="px-4 py-3">{ORIGIN_LABEL[r.origin_type] ?? r.origin_type}</td>
                <td className="px-4 py-3">{r.applicant_nm}</td>
                <td className="px-4 py-3 text-gray-500">{r.applicant_dt}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[r.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
