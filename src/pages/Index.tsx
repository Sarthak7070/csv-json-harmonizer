
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import BwrTable from "../components/BwrTable";
import { Download, FileText } from "lucide-react";
import ColumnSelector from "../components/ColumnSelector";

const HEADER_URL = "http://localhost:8000/read_bwr/header";
const DATA_URL = "http://localhost:8000/read_bwr/data";

const Index = () => {
  const [header, setHeader] = useState<string[] | null>(null);
  const [data, setData] = useState<Record<string, string>[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Fetch only the header
  const fetchHeader = async () => {
    setLoading(true);
    setHeader(null);
    setData(null);
    setSelectedColumns([]);
    try {
      const resp = await fetch(HEADER_URL);
      if (!resp.ok) {
        const text = await resp.text();
        toast({
          title: `Fetch error`,
          description:
            resp.status === 404
              ? "CSV or config not found – please upload them to the backend."
              : text || "Unknown server error.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      const json = await resp.json();
      setHeader(json.header);
      setSelectedColumns([]); // No columns selected at start
      toast({
        title: "Success",
        description: "Header loaded from server",
      });
    } catch (e: any) {
      toast({
        title: "Network error",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch table data for selected columns
  const fetchDataForColumns = async () => {
    if (!selectedColumns.length) {
      toast({
        title: "Select columns",
        description: "Please select at least one column",
        variant: "destructive",
      });
      return;
    }
    setLoadingData(true);
    setData(null);
    try {
      const resp = await fetch(DATA_URL, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ columns: selectedColumns }),
      });
      if (!resp.ok) {
        const text = await resp.text();
        toast({
          title: `Fetch error`,
          description: text || "Unknown server error.",
          variant: "destructive",
        });
        setLoadingData(false);
        return;
      }
      const json = await resp.json();
      setData(json.data);
      toast({
        title: "Success",
        description: "Data loaded from server",
      });
    } catch (e: any) {
      toast({
        title: "Network error",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e5deff] via-[#d3e4fd] to-white py-16 px-4 flex flex-col items-center relative">
      <div className="mx-auto max-w-2xl w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-2 mb-8">
          <div className="flex items-center space-x-3">
            <FileText size={32} className="text-violet-800" />
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
              CSV→JSON Harmonizer
            </h1>
          </div>
          <Button
            size="lg"
            variant="default"
            className="gap-2 bg-gradient-to-r from-violet-500 via-purple-400 to-blue-400 hover:from-violet-600 hover:to-blue-500 shadow"
            onClick={fetchHeader}
            disabled={loading}
          >
            <Download className="w-5 h-5" />
            {loading ? "Loading..." : "Fetch Header"}
          </Button>
        </div>
        <div className="mb-6 text-gray-600 text-center">
          Click "Fetch Header" to read only the column names. Then select columns and load data.
        </div>
        {/* Show dropdown if columns (header) available */}
        {header && header.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
            <ColumnSelector
              columns={header}
              selected={selectedColumns}
              onChange={setSelectedColumns}
              disabled={loading || loadingData}
            />
            <Button
              variant="outline"
              className="ml-2"
              onClick={fetchDataForColumns}
              disabled={loading || loadingData || selectedColumns.length === 0}
            >
              {loadingData ? "Loading data..." : "Load Data"}
            </Button>
          </div>
        )}
        <BwrTable
          header={header}
          data={data}
          loading={loading || loadingData}
          visibleHeader={selectedColumns.length > 0 ? selectedColumns : []}
        />
      </div>
    </div>
  );
};

export default Index;

