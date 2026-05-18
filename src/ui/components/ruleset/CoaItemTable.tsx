interface CoaItemRule {
  id: string;
  itemCd: string;
  itemNmKor: string;
  itemNmEng: string;
  scientificNm: string;
  hsk: string;
  allowedCountries: readonly string[];
}

interface Props { items: CoaItemRule[]; }

export default function CoaItemTable({ items }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-xs">
        <thead className="bg-gray-50 text-left text-gray-500 uppercase tracking-wider">
          <tr>
            {["코드", "품목(한)", "품목(영)", "HSK", "허용국 목록"].map((h) => (
              <th key={h} className="px-3 py-2">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="px-3 py-2 font-mono text-blue-600">{item.itemCd}</td>
              <td className="px-3 py-2 font-medium">{item.itemNmKor}</td>
              <td className="px-3 py-2 text-gray-500">{item.itemNmEng}</td>
              <td className="px-3 py-2 font-mono text-gray-400">{item.hsk}</td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap gap-1">
                  {item.allowedCountries.map((cc) => (
                    <span key={cc} className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-blue-600">
                      {cc}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
