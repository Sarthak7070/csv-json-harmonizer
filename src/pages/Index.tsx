import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import BwrTable from "../components/BwrTable";
import { Download, FileText } from "lucide-react";
import ColumnSelector from "../components/ColumnSelector";
import PivotSelector from "../components/PivotSelector";
import { aggregateData } from "../utils/dataAggregation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const HEADER_URL_1 = "http://localhost:8000/read_bwr/header";
const DATA_URL_1 = "http://localhost:8000/read_bwr/data";

const HEADER_URL_2 = "http://localhost:8000/read_adsr/header";
const DATA_URL_2 = "http://localhost:8000/read_adsr/data";

const Index = () => {
  const [header1, setHeader1] = useState<string[] | null>(null);
  const [data1, setData1] = useState<Record<string, string>[] | null>(null);
  const [loading1, setLoading1] = useState(false);
  const [selectedColumns1, setSelectedColumns1] = useState<string[]>([]);
  const [loadingData1, setLoadingData1] = useState(false);

  const [header2, setHeader2] = useState<string[] | null>(null);
  const [data2, setData2] = useState<Record<string, string>[] | null>(null);
  const [loading2, setLoading2] = useState(false);
  const [selectedColumns2, setSelectedColumns2] = useState<string[]>([]);
  const [loadingData2, setLoadingData2] = useState(false);

  const [pivotColumn1, setPivotColumn1] = useState<string>("");
  const [pivotColumn2, setPivotColumn2] = useState<string>("");

  const [selectedCalculationColumn1, setSelectedCalculationColumn1] = useState<string>("");
  const [selectedCalculationColumn2, setSelectedCalculationColumn2] = useState<string>("");
  const [operation, setOperation] = useState<string>("+");

  const fetchHeader1 = async () => {
    setLoading1(true);
    setHeader1(null);
    setData1(null);
    setSelectedColumns1([]);
    try {
      const resp = await fetch(HEADER_URL_1);
      if (!resp.ok) {
        const text = await resp.text();
        toast({
          title: `Workspace error (File 1)`,
          description:
            resp.status === 404
              ? "CSV or config not found for File 1 – please upload them to the backend."
              : text || "Unknown server error.",
          variant: "destructive",
        });
        setLoading1(false);
        return;
      }
      const json = await resp.json();
      console.log("Received header data (File 1):", json);

      let extractedHeaders: string[] = [];
      if (json.columns) {
        extractedHeaders = Object.keys(json.columns);
      } else if (json.header) {
        extractedHeaders = json.header;
      } else {
        extractedHeaders = Object.keys(json);
      }

      setHeader1(extractedHeaders);
      setSelectedColumns1([]);
      toast({
        title: "Success (File 1)",
        description: `${extractedHeaders.length} columns loaded from server for File 1`,
      });
    } catch (e: any) {
      console.error("Error fetching headers (File 1):", e);
      toast({
        title: "Network error (File 1)",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoading1(false);
    }
  };

  const fetchHeader2 = async () => {
    setLoading2(true);
    setHeader2(null);
    setData2(null);
    setSelectedColumns2([]);
    try {
      const resp = await fetch(HEADER_URL_2);
      if (!resp.ok) {
        const text = await resp.text();
        toast({
          title: `Workspace error (File 2)`,
          description:
            resp.status === 404
              ? "CSV or config not found for File 2 – please upload them to the backend."
              : text || "Unknown server error.",
          variant: "destructive",
        });
        setLoading2(false);
        return;
      }
      const json = await resp.json();
      console.log("Received header data (File 2):", json);

      let extractedHeaders: string[] = [];

      if (Array.isArray(json) && json.every(item => typeof item === 'string')) {
        extractedHeaders = json;
      } else if (json.columns) {
        extractedHeaders = Object.keys(json.columns);
      } else if (json.header) {
        extractedHeaders = json.header;
      } else {
        console.warn("Unexpected header format for File 2:", json);
        toast({
          title: "Warning (File 2)",
          description: "Received unexpected header format from server.",
          variant: "default"
        });
        setLoading2(false);
        return;
      }

      setHeader2(extractedHeaders);
      setSelectedColumns2([]);
      toast({
        title: "Success (File 2)",
        description: `${extractedHeaders.length} columns loaded from server for File 2`,
      });
    } catch (e: any) {
      console.error("Error fetching headers (File 2):", e);
      toast({
        title: "Network error (File 2)",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoading2(false);
    }
  };

  const fetchDataForColumns1 = async () => {
    if (!selectedColumns1.length) {
      toast({
        title: "Select columns (File 1)",
        description: "Please select at least one column for File 1",
        variant: "destructive",
      });
      return;
    }
    setLoadingData1(true);
    setData1(null);
    try {
      console.log("Fetching data for columns (File 1):", selectedColumns1);
      const resp = await fetch(DATA_URL_1, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ columns: selectedColumns1 }),
      });
      if (!resp.ok) {
        const text = await resp.text();
        toast({
          title: `Workspace error (File 1)`,
          description: text || "Unknown server error.",
          variant: "destructive",
        });
        setLoadingData1(false);
        return;
      }
      const json = await resp.json();
      console.log("Received data (File 1):", json);

      let extractedData = [];
      if (json.data) {
        extractedData = json.data;
      } else {
        extractedData = Array.isArray(json) ? json : [json];
      }

      const finalData = pivotColumn1
        ? aggregateData(extractedData, pivotColumn1, selectedColumns1)
        : extractedData;

      setData1(finalData);
      toast({
        title: "Success (File 1)",
        description: `${finalData.length} rows loaded from server for File 1`,
      });
    } catch (e: any) {
      console.error("Error fetching data (File 1):", e);
      toast({
        title: "Network error (File 1)",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoadingData1(false);
    }
  };

  const fetchDataForColumns2 = async () => {
    if (!selectedColumns2.length) {
      toast({
        title: "Select columns (File 2)",
        description: "Please select at least one column for File 2",
        variant: "destructive",
      });
      return;
    }
    setLoadingData2(true);
    setData2(null);
    try {
      console.log("Fetching data for columns (File 2):", selectedColumns2);
      const resp = await fetch(DATA_URL_2, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ columns: selectedColumns2 }),
      });
      if (!resp.ok) {
        const text = await resp.text();
        toast({
          title: `Workspace error (File 2)`,
          description: text || "Unknown server error.",
          variant: "destructive",
        });
        setLoadingData2(false);
        return;
      }
      const json = await resp.json();
      console.log("Received data (File 2):", json);

      let extractedData = [];
      if (json.data) {
        extractedData = json.data;
      } else {
        extractedData = Array.isArray(json) ? json : [json];
      }

      const finalData = pivotColumn2
        ? aggregateData(extractedData, pivotColumn2, selectedColumns2)
        : extractedData;

      setData2(finalData);
      toast({
        title: "Success (File 2)",
        description: `${finalData.length} rows loaded from server for File 2`,
      });
    } catch (e: any) {
      console.error("Error fetching data (File 2):", e);
      toast({
        title: "Network error (File 2)",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoadingData2(false);
    }
  };

  const calculateResults = () => {
    if (!data1 || !data2 || !selectedCalculationColumn1 || !selectedCalculationColumn2) return [];

    const maxLength = Math.max(data1.length, data2.length);
    const results = [];

    for (let i = 0; i < maxLength; i++) {
      const value1 = parseFloat(data1[i]?.[selectedCalculationColumn1] || "0");
      const value2 = parseFloat(data2[i]?.[selectedCalculationColumn2] || "0");
      let result = 0;

      switch (operation) {
        case "+":
          result = value1 + value2;
          break;
        case "-":
          result = value1 - value2;
          break;
        case "*":
          result = value1 * value2;
          break;
        case "/":
          result = value2 !== 0 ? value1 / value2 : NaN;
          break;
        default:
          result = 0;
      }

      results.push(isNaN(result) ? "Error" : result.toFixed(2));
    }

    return results;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e5deff] via-[#d3e4fd] to-white py-16 px-4 flex flex-col items-center relative">
      <div className="mx-auto w-full max-w-[1800px] space-y-8">
        <div className="flex flex-row justify-between items-start gap-4 w-full mb-8">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-2">
              <div className="flex items-center space-x-3">
                <FileText size={32} className="text-violet-800" />
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                  BWR file data
                </h1>
              </div>
              <Button
                size="lg"
                variant="default"
                className="gap-2 bg-gradient-to-r from-violet-500 via-purple-400 to-blue-400 hover:from-violet-600 hover:to-blue-500 shadow"
                onClick={fetchHeader1}
                disabled={loading1}
              >
                <Download className="w-5 h-5" />
                {loading1 ? "Loading..." : "Fetch Header"}
              </Button>
            </div>
          </div>

          <div className="flex-1 text-right">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-2">
              <div className="flex items-center space-x-3">
                <FileText size={32} className="text-teal-700" />
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                  ADSR file data
                </h1>
              </div>
              <Button
                size="lg"
                variant="default"
                className="gap-2 bg-gradient-to-r from-violet-500 via-purple-400 to-blue-400 hover:from-violet-600 hover:to-blue-500 shadow"
                onClick={fetchHeader2}
                disabled={loading2}
              >
                <Download className="w-5 h-5" />
                {loading2 ? "Loading..." : "Fetch Header"}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            {header1 && header1.length > 0 && (
              <div className="mb-4 space-y-4">
                <ColumnSelector
                  columns={header1}
                  selected={selectedColumns1}
                  onChange={setSelectedColumns1}
                  disabled={loading1 || loadingData1}
                />
                <div className="flex flex-wrap gap-4 items-center justify-between">
                  <PivotSelector
                    columns={header1}
                    selectedPivot={pivotColumn1}
                    onChange={setPivotColumn1}
                    disabled={loading1 || loadingData1}
                  />
                  <Button
                    variant="outline"
                    onClick={fetchDataForColumns1}
                    disabled={loading1 || loadingData1 || selectedColumns1.length === 0}
                  >
                    {loadingData1 ? "Loading data..." : "Load Data"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div>
            {header2 && header2.length > 0 && (
              <div className="mb-4 space-y-4">
                <ColumnSelector
                  columns={header2}
                  selected={selectedColumns2}
                  onChange={setSelectedColumns2}
                  disabled={loading2 || loadingData2}
                />
                <div className="flex flex-wrap gap-4 items-center justify-between">
                  <PivotSelector
                    columns={header2}
                    selectedPivot={pivotColumn2}
                    onChange={setPivotColumn2}
                    disabled={loading2 || loadingData2}
                  />
                  <Button
                    variant="outline"
                    onClick={fetchDataForColumns2}
                    disabled={loading2 || loadingData2 || selectedColumns2.length === 0}
                  >
                    {loadingData2 ? "Loading data..." : "Load Data"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {header1 && header2 && (
          <div className="flex items-center justify-center gap-4 mb-4">
            <Select value={selectedCalculationColumn1} onValueChange={setSelectedCalculationColumn1}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select column from File 1" />
              </SelectTrigger>
              <SelectContent>
                {header1?.map((column) => (
                  <SelectItem key={column} value={column}>
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={operation} onValueChange={setOperation}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Operation" />
              </SelectTrigger>
              <SelectContent>
                {["+", "-", "*", "/"].map((op) => (
                  <SelectItem key={op} value={op}>
                    {op}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCalculationColumn2} onValueChange={setSelectedCalculationColumn2}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select column from File 2" />
              </SelectTrigger>
              <SelectContent>
                {header2?.map((column) => (
                  <SelectItem key={column} value={column}>
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <BwrTable
          header1={header1}
          header2={header2}
          data1={data1}
          data2={data2}
          visibleHeader1={selectedColumns1}
          visibleHeader2={selectedColumns2}
          calculationResults={calculateResults()}
          calculationOperation={operation}
          selectedColumn1={selectedCalculationColumn1}
          selectedColumn2={selectedCalculationColumn2}
        />
      </div>
    </div>
  );
};

export default Index;
