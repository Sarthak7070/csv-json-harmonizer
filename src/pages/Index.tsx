import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import BwrTable from "../components/BwrTable";
import { Download, FileText } from "lucide-react";
import ColumnSelector from "../components/ColumnSelector";

// Endpoints for the first file
const HEADER_URL_1 = "http://localhost:8000/read_bwr/header";
const DATA_URL_1 = "http://localhost:8000/read_bwr/data";

// Endpoints for the second file
const HEADER_URL_2 = "http://localhost:8000/read_adsr/header"; // <<< No change here
const DATA_URL_2 = "http://localhost:8000/read_adsr/data";   // <<< No change here

const Index = () => {
  // State for the first file
  const [header1, setHeader1] = useState<string[] | null>(null);
  const [data1, setData1] = useState<Record<string, string>[] | null>(null);
  const [loading1, setLoading1] = useState(false);
  const [selectedColumns1, setSelectedColumns1] = useState<string[]>([]);
  const [loadingData1, setLoadingData1] = useState(false);

  // State for the second file
  const [header2, setHeader2] = useState<string[] | null>(null);
  const [data2, setData2] = useState<Record<string, string>[] | null>(null);
  const [loading2, setLoading2] = useState(false);
  const [selectedColumns2, setSelectedColumns2] = useState<string[]>([]);
  const [loadingData2, setLoadingData2] = useState(false);

  // Fetch only the header for the first file (Keep as is, assuming its format)
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

      // This logic remains for the first file's expected formats
      let extractedHeaders: string[] = [];
      if (json.columns) {
        extractedHeaders = Object.keys(json.columns);
      } else if (json.header) {
        extractedHeaders = json.header;
      } else {
        // Fallback: try to use the entire object as headers if it's a simple key-value
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

  // Fetch only the header for the second file (Updated logic for array response)
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

      // *** UPDATED LOGIC HERE ***
      if (Array.isArray(json) && json.every(item => typeof item === 'string')) {
          // If the response is a JSON array of strings, use it directly
          extractedHeaders = json;
      } else if (json.columns) {
         // Keep existing logic for other potential formats as fallback
        extractedHeaders = Object.keys(json.columns);
      } else if (json.header) {
         // Keep existing logic for other potential formats as fallback
        extractedHeaders = json.header;
      }
       else {
          // Fallback: log a warning if the format is unexpected
          console.warn("Unexpected header format for File 2:", json);
           toast({
              title: "Warning (File 2)",
              description: "Received unexpected header format from server.",
              variant: "default"
           });
           setLoading2(false);
           return; // Stop processing if format is unexpected
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


  // Fetch table data for selected columns for the first file (Keep as is)
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

      setData1(extractedData);
      toast({
        title: "Success (File 1)",
        description: `${extractedData.length} rows loaded from server for File 1`,
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

    // Fetch table data for selected columns for the second file (Keep as is, assumes data format is consistent)
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

      // This logic remains for the data response format
      let extractedData = [];
      if (json.data) {
        extractedData = json.data;
      } else {
        extractedData = Array.isArray(json) ? json : [json];
      }

      setData2(extractedData);
      toast({
        title: "Success (File 2)",
        description: `${extractedData.length} rows loaded from server for File 2`,
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


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e5deff] via-[#d3e4fd] to-white py-16 px-4 flex flex-col items-center relative">
      <div className="mx-auto max-w-7xl w-full"> {/* Increased max-width to accommodate two sections */}
        <div className="flex flex-wrap justify-center gap-12 w-full"> {/* Use flexbox to arrange sections */}

          {/* Section for File 1 */}
          <div className="w-full lg:w-1/2 min-w-[300px] max-w-[600px]"> {/* Adjust width as needed */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-2 mb-8">
              <div className="flex items-center space-x-3">
                <FileText size={32} className="text-violet-800" />
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                  BWR file data
                </h1> {/* Updated title */}
              </div>
              <Button
                size="lg"
                variant="default"
                className="gap-2 bg-gradient-to-r from-violet-500 via-purple-400 to-blue-400 hover:from-violet-600 hover:to-blue-500 shadow"
                onClick={fetchHeader1} // Use fetchHeader1
                disabled={loading1} // Use loading1
              >
                <Download className="w-5 h-5" />
                {loading1 ? "Loading..." : "Fetch Header"}
              </Button>
            </div>
            <div className="mb-6 text-gray-600 text-center">
              Click "Fetch Header" to read only the column names for File 1. Then select columns and load data.
            </div>
            {/* Show dropdown if columns (header) available */}
            {header1 && header1.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
                <ColumnSelector
                  columns={header1} // Use header1
                  selected={selectedColumns1} // Use selectedColumns1
                  onChange={setSelectedColumns1} // Use setSelectedColumns1
                  disabled={loading1 || loadingData1} // Use loading1 and loadingData1
                />
                <Button
                  variant="outline"
                  className="ml-2"
                  onClick={fetchDataForColumns1} // Use fetchDataForColumns1
                  disabled={loading1 || loadingData1 || selectedColumns1.length === 0} // Use loading1, loadingData1, selectedColumns1
                >
                  {loadingData1 ? "Loading data..." : "Load Data"}
                </Button>
              </div>
            )}
            <BwrTable
              header={header1} // Use header1
              data={data1} // Use data1
              loading={loading1 || loadingData1} // Use loading1 and loadingData1
              visibleHeader={selectedColumns1.length > 0 ? selectedColumns1 : []} // Use selectedColumns1
            />
          </div>

          {/* Section for File 2 */}
          <div className="w-full lg:w-1/2 min-w-[300px] max-w-[600px]"> {/* Adjust width as needed */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-2 mb-8">
              <div className="flex items-center space-x-3">
                <FileText size={32} className="text-teal-700" /> {/* Different color icon */}
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                  ADSR file data
                </h1> {/* Title for the second file */}
              </div>
              <Button
                size="lg"
                variant="default"
                className="gap-2 bg-gradient-to-r from-violet-500 via-purple-400 to-blue-400 hover:from-violet-600 hover:to-blue-500 shadow"
                onClick={fetchHeader2} // Use fetchHeader2
                disabled={loading2} // Use loading2
              >
                <Download className="w-5 h-5" />
                {loading2 ? "Loading..." : "Fetch Header"}
              </Button>
            </div>
            <div className="mb-6 text-gray-600 text-center">
              Click "Fetch Header" to read only the column names for File 2. Then select columns and load data.
            </div>
            {/* Show dropdown if columns (header) available */}
            {header2 && header2.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
                <ColumnSelector
                  columns={header2} // Use header2
                  selected={selectedColumns2} // Use selectedColumns2
                  onChange={setSelectedColumns2} // Use setSelectedColumns2
                  disabled={loading2 || loadingData2} // Use loading2 and loadingData2
                />
                <Button
                  variant="outline"
                  className="ml-2"
                  onClick={fetchDataForColumns2} // Use fetchDataForColumns2
                  disabled={loading2 || loadingData2 || selectedColumns2.length === 0} // Use loading2, loadingData2, selectedColumns2
                >
                  {loadingData2 ? "Loading data..." : "Load Data"}
                </Button>
              </div>
            )}
            <BwrTable
              header={header2} // Use header2
              data={data2} // Use data2
              loading={loading2 || loadingData2} // Use loading2 and loadingData2
              visibleHeader={selectedColumns2.length > 0 ? selectedColumns2 : []} // Use selectedColumns2
            />
          </div>

        </div> {/* End of flex container */}
      </div> {/* End of max-w container */}
    </div>
  );
};

export default Index;