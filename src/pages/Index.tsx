import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import BwrTable from "../components/BwrTable";
import { Download, FileText } from "lucide-react";

const API_URL = "http://localhost:8000/read_bwr/";

const Index = () => {
  const [header, setHeader] = useState<string[] | null>(null);
  const [data, setData] = useState<Record<string, string>[] | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setHeader(null);
    setData(null);
    try {
      const resp = await fetch(API_URL);
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
      setLoading(false);
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
            onClick={fetchData}
            disabled={loading}
          >
            <Download className="w-5 h-5" />
            {loading ? "Loading..." : "Fetch Data"}
          </Button>
        </div>
        <div className="mb-6 text-gray-600 text-center">
          Click &quot;Fetch Data&quot; to retrieve processed rows from your API.
        </div>
        <BwrTable header={header} data={data} loading={loading} />
      </div>
    </div>
  );
};

export default Index;
