
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useMemo } from "react";

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

  // Calculate total for calculation column
  const calculationTotal = useMemo(() => {
    if (!calculationResults.length) return "";
    
    const numericValues = calculationResults
      .map(val => parseFloat(val))
      .filter(val => !isNaN(val));
    
    if (numericValues.length === 0) return "N/A";
    const sum = numericValues.reduce((acc, val) => acc + val, 0);
    return sum.toFixed(2);
  }, [calculationResults]);

  return (
    <Card className="p-0 mt-6 overflow-x-auto w-full">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-slate-100">
          <tr>
            {/* File 1 Headers - with unique background */}
            {columns1.map((col) => (
              <th
                key={`file1-${col}`}
                className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-blue-50"
              >
                {col}
              </th>
            ))}

            {/* Calculation Header */}
            {selectedColumn1 && selectedColumn2 && (
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider bg-violet-100 border-l-2 border-r-2 border-violet-200">
                {`${selectedColumn1} ${calculationOperation} ${selectedColumn2}`}
              </th>
            )}

            {/* File 2 Headers - with unique background */}
            {columns2.map((col) => (
              <th
                key={`file2-${col}`}
                className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-green-50"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: maxRows }).map((_, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"}>
              {/* File 1 Data */}
              {columns1.map((col) => (
                <td
                  key={`file1-${col}-${rowIndex}`}
                  className="px-6 py-3 whitespace-nowrap text-sm text-gray-800 bg-blue-50/30"
                >
                  {data1[rowIndex]?.[col] ?? ""}
                </td>
              ))}

              {/* Calculation Result */}
              {selectedColumn1 && selectedColumn2 && (
                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-800 text-center bg-violet-50 font-medium border-l-2 border-r-2 border-violet-200">
                  {calculationResults[rowIndex] ?? ""}
                </td>
              )}

              {/* File 2 Data */}
              {columns2.map((col) => (
                <td
                  key={`file2-${col}-${rowIndex}`}
                  className="px-6 py-3 whitespace-nowrap text-sm text-gray-800 bg-green-50/30"
                >
                  {data2[rowIndex]?.[col] ?? ""}
                </td>
              ))}
            </tr>
          ))}
          
          {/* Total Row for Calculation Column */}
          {selectedColumn1 && selectedColumn2 && calculationResults.length > 0 && (
            <tr className="border-t-2 border-gray-300 font-bold">
              {/* Empty cells for File 1 columns */}
              {columns1.map((col, idx) => (
                <td key={`total-spacer1-${idx}`} className="px-6 py-3 bg-blue-50/30"></td>
              ))}
              
              {/* Total cell for calculation column */}
              <td className="px-6 py-3 whitespace-nowrap text-sm font-bold text-gray-800 text-center bg-violet-100 border-l-2 border-r-2 border-violet-200">
                Total: {calculationTotal}
              </td>
              
              {/* Empty cells for File 2 columns */}
              {columns2.map((col, idx) => (
                <td key={`total-spacer2-${idx}`} className="px-6 py-3 bg-green-50/30"></td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}
