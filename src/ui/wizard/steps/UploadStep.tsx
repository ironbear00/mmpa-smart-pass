import { useRef, useState } from "react";
import type { WizardDispatch, WizardState } from "../fsm";

interface DropZoneProps {
  label: string;
  file: File | null;
  onFile: (f: File) => void;
  onRemove: () => void;
}

function DropZone({ label, file, onFile, onRemove }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFile(dropped);
  };

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      {file ? (
        <div className="flex items-center justify-between rounded-lg border border-green-300 bg-green-50 px-3 py-2">
          <span className="truncate text-sm text-green-700">{file.name}</span>
          <button type="button" onClick={onRemove} className="ml-2 shrink-0 text-xs text-gray-400 hover:text-red-500">✕</button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-5 transition-colors ${
            dragging ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50"
          }`}
        >
          <span className="text-xs text-gray-400">파일을 드래그하거나 클릭해서 선택</span>
          <input ref={inputRef} type="file" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
        </div>
      )}
    </div>
  );
}

interface Props { state: WizardState; dispatch: WizardDispatch }

export default function UploadStep({ state, dispatch }: Props) {
  const allDocs = [...new Set(state.items.flatMap((i) => i.verdict.requiredDocs ?? []))];
  const tracks = [...new Set(state.items.map((i) => i.verdict.documentTrack).filter(Boolean))] as string[];

  const [files, setFiles] = useState<Record<string, File | null>>(
    Object.fromEntries(allDocs.map((d) => [d, null]))
  );

  const allAttached = allDocs.length === 0 || allDocs.every((d) => files[d] !== null);

  const setFile = (doc: string, f: File) => setFiles((prev) => ({ ...prev, [doc]: f }));
  const removeFile = (doc: string) => setFiles((prev) => ({ ...prev, [doc]: null }));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">필수 서류 첨부</h2>

      {allDocs.length === 0 ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-700">이 신청에는 별도 첨부 서류가 없습니다.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-gray-600">아래 서류를 모두 첨부한 후 다음 단계로 진행하세요.</p>
            {tracks.includes("catch_certificate") && (
              <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">어획증명서 트랙</span>
            )}
            {tracks.includes("coa") && (
              <span className="rounded bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-600">COA 트랙</span>
            )}
          </div>
          {allDocs.map((doc) => (
            <DropZone key={doc} label={doc} file={files[doc]}
              onFile={(f) => setFile(doc, f)} onRemove={() => removeFile(doc)} />
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400">
        ※ 실제 파일 업로드는 정식 시스템에서 처리됩니다. 이 화면은 PoC 시연용입니다.
      </p>

      <div className="flex justify-between pt-2">
        <button type="button" onClick={() => dispatch({ type: "BACK" })}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">이전</button>
        <button type="button" disabled={!allAttached} onClick={() => dispatch({ type: "NEXT" })}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40">
          다음 단계
        </button>
      </div>
    </div>
  );
}
