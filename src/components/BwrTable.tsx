
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface BwrTableProps {
  header1: string[] | null;
  header2: string[] | null;
  data1: Record<string, string>[] | null;
  data2: Record<string, string>[] | null;
  visibleHeader1?: string[];
  visibleHeader2?: string[];
  calculationResults?: string[];
  calculationOperation?: string;
  selectedColumn1?: string;
  selectedColumn2?: string;
}

export default function BwrTable({ 
  header1, 
  header2, 
  data1, 
  data2, 
  visibleHeader1 = [], 
  visibleHeader2 = [],
  calculationResults = [],
  calculationOperation = "",
  selectedColumn1 = "",
  selectedColumn2 = ""
}: BwrTableProps) {
  if (!header1 || !header2 || !data1 || !data2) {
    return (
      <Card className="p-8 mt-8 text-center text-gray-400">
        <div>No data to display.</div>
      </Card>
    );
  }

  const columns1 = visibleHeader1.length > 0 ? visibleHeader1 : header1;
  const columns2 = visibleHeader2.length > 0 ? visibleHeader2 : header2;
  const maxRows = Math.max(data1.length, data2.length, calculationResults.length);

  return (
    <Card className="p-0 mt-6 overflow-x-auto w-full">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-slate-100">
          <tr>
            {/* File 1 Headers */}
            {columns1.map((col) => (
              <th
                key={`file1-${col}`}
                className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
              >
                {col}
              </th>
            ))}

            {/* Calculation Header */}
            {selectedColumn1 && selectedColumn2 && (
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider bg-violet-50">
                {`${selectedColumn1} ${calculationOperation} ${selectedColumn2}`}
              </th>
            )}

            {/* File 2 Headers */}
            {columns2.map((col) => (
              <th
                key={`file2-${col}`}
                className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: maxRows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {/* File 1 Data */}
              {columns1.map((col) => (
                <td
                  key={`file1-${col}-${rowIndex}`}
                  className="px-6 py-3 whitespace-nowrap text-sm text-gray-800"
                >
                  {data1[rowIndex]?.[col] ?? ""}
                </td>
              ))}

              {/* Calculation Result */}
              {selectedColumn1 && selectedColumn2 && (
                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-800 text-center bg-violet-50 font-medium">
                  {calculationResults[rowIndex] ?? ""}
                </td>
              )}

              {/* File 2 Data */}
              {columns2.map((col) => (
                <td
                  key={`file2-${col}-${rowIndex}`}
                  className="px-6 py-3 whitespace-nowrap text-sm text-gray-800"
                >
                  {data2[rowIndex]?.[col] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
