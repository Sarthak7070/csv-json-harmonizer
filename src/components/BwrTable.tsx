
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface BwrTableProps {
  header: string[] | null;
  data: Record<string, string>[] | null;
  loading?: boolean;
}

export default function BwrTable({ header, data, loading }: BwrTableProps) {
  if (loading) {
    return (
      <Card className="p-4 mt-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-full mb-2" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      </Card>
    );
  }
  if (!header || !data) {
    return (
      <Card className="p-8 mt-8 text-center text-gray-400">
        <div>No data to display.</div>
      </Card>
    );
  }
  return (
    <Card className="p-0 mt-6 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-slate-100">
          <tr>
            {header.map((col) => (
              <th
                key={col}
                className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={header.length}
                className="px-6 py-4 text-center text-gray-400"
              >
                No results.
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx}>
                {header.map((col) => (
                  <td key={col} className="px-6 py-3 whitespace-nowrap text-sm text-gray-800">
                    {row[col] ?? ""}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Card>
  );
}
