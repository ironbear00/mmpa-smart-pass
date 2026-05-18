import type { VerdictKind } from "../../contracts/responses";

const STYLES: Record<VerdictKind, string> = {
  eligible:    "bg-green-100 text-green-800 border-green-300",
  ineligible:  "bg-red-100 text-red-800 border-red-300",
  conditional: "bg-yellow-100 text-yellow-800 border-yellow-300",
  unknown:     "bg-gray-100 text-gray-700 border-gray-300",
};

const LABELS: Record<VerdictKind, string> = {
  eligible:    "적합",
  ineligible:  "부적합",
  conditional: "조건부",
  unknown:     "미확인",
};

interface Props {
  kind: VerdictKind;
}

export default function VerdictBadge({ kind }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${STYLES[kind]}`}
    >
      {LABELS[kind]}
    </span>
  );
}
