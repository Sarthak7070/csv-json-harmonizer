import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import BwrTable from "../components/BwrTable";
import { Download, FileText, Upload, ArrowUp } from "lucide-react";
import ColumnSelector from "../components/ColumnSelector";
import PivotSelector from "../components/PivotSelector";
import { aggregateData } from "../utils/dataAggregation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

const HEADER_URL_1 = "http://localhost:8000/read_bwr/header";
const DATA_URL_1 = "http://localhost:8000/read_bwr/data";

const HEADER_URL_2 = "http://localhost:8000/read_adsr/header";
const DATA_URL_2 = "http://localhost:8000/read_adsr/data";

const UPLOAD_BWR_URL = "http://localhost:8000/upload_bwr";
const UPLOAD_ADSR_URL = "http://localhost:8000/upload_adsr";

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

  const [bwrFile, setBwrFile] = useState<File | null>(null);
  const [adsrFile, setAdsrFile] = useState<File | null>(null);
  const [uploadingBwr, setUploadingBwr] = useState(false);
  const [uploadingAdsr, setUploadingAdsr] = useState(false);
  const [uploadProgressBwr, setUploadProgressBwr] = useState(0);
  const [uploadProgressAdsr, setUploadProgressAdsr] = useState(0);

  const handleBwrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setBwrFile(e.target.files[0]);
    }
  };

  const handleAdsrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAdsrFile(e.target.files[0]);
    }
  };

  const uploadBwrFile = () => {
    if (!bwrFile) {
      toast({
        title: "No file selected",
        description: "Please select a BWR file to upload.",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    const allowedTypes = ['.csv', '.txt', '.xls', '.xlsx'];
    const fileExtension = bwrFile.name.substring(bwrFile.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV, TXT, XLS, or XLSX file.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', bwrFile);
    
    setUploadingBwr(true);
    setUploadProgressBwr(0);
    
    const xhr = new XMLHttpRequest();
    xhr.open('POST', UPLOAD_BWR_URL);
    
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100);
        setUploadProgressBwr(progress);
      }
    };
    
    xhr.onload = () => {
      setUploadingBwr(false);
      
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          toast({
            title: "Success",
            description: response.message || "BWR file uploaded successfully.",
          });
          // Auto fetch headers after successful upload
          fetchHeader1();
        } catch (error) {
          toast({
            title: "Error",
            description: "Error processing server response.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Upload failed",
          description: "Failed to upload BWR file. Please try again.",
          variant: "destructive",
        });
      }
    };
    
    xhr.onerror = () => {
      setUploadingBwr(false);
      toast({
        title: "Connection error",
        description: "Network error occurred. Please check your connection.",
        variant: "destructive",
      });
    };
    
    xhr.send(formData);
  };

  const uploadAdsrFile = () => {
    if (!adsrFile) {
      toast({
        title: "No file selected",
        description: "Please select an ADSR file to upload.",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    const allowedTypes = ['.csv', '.txt', '.xls', '.xlsx'];
    const fileExtension = adsrFile.name.substring(adsrFile.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV, TXT, XLS, or XLSX file.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', adsrFile);
    
    setUploadingAdsr(true);
    setUploadProgressAdsr(0);
    
    const xhr = new XMLHttpRequest();
    xhr.open('POST', UPLOAD_ADSR_URL);
    
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100);
        setUploadProgressAdsr(progress);
      }
    };
    
    xhr.onload = () => {
      setUploadingAdsr(false);
      
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          toast({
            title: "Success",
            description: response.message || "ADSR file uploaded successfully.",
          });
          // Auto fetch headers after successful upload
          fetchHeader2();
        } catch (error) {
          toast({
            title: "Error",
            description: "Error processing server response.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Upload failed",
          description: "Failed to upload ADSR file. Please try again.",
          variant: "destructive",
        });
      }
    };
    
    xhr.onerror = () => {
      setUploadingAdsr(false);
      toast({
        title: "Connection error",
        description: "Network error occurred. Please check your connection.",
        variant: "destructive",
      });
    };
    
    xhr.send(formData);
  };

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
    
    // Important: Don't reset data1 here to fix the loading issue
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
    
    // Important: Don't reset data2 here to fix the loading issue
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

  // Initialize default data for File 2 if not loaded
  const dataForDisplay1 = data1 || [];
  const dataForDisplay2 = data2 || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e5deff] via-[#d3e4fd] to-white py-16 px-4 flex flex-col items-center relative">
      <div className="mx-auto w-full max-w-[1800px] space-y-8">
        {/* File Headers Section */}
        <div className="grid grid-cols-2 gap-8">
          {/* BWR File Section */}
          <Card className="p-6 bg-blue-50/50 border-blue-200 shadow">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-2 mb-6">
              <div className="flex items-center space-x-3">
                <FileText size={32} className="text-violet-800" />
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                  BWR file data
                </h1>
              </div>

              {/* New file upload section */}
              <div className="flex flex-col w-full space-y-2 sm:w-auto">
                <div className="flex items-center gap-2">
                  <Input 
                    id="bwr-file" 
                    type="file" 
                    accept=".csv,.txt,.xls,.xlsx"
                    onChange={handleBwrFileChange}
                    disabled={uploadingBwr}
                    className="max-w-xs text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={uploadBwrFile}
                    disabled={!bwrFile || uploadingBwr}
                    className="whitespace-nowrap"
                  >
                    <ArrowUp className="w-4 h-4 mr-1" />
                    Upload
                  </Button>
                </div>
                
                {/* Display selected file name */}
                {bwrFile && (
                  <div className="text-sm text-gray-600 font-medium">
                    {bwrFile.name} ({Math.round(bwrFile.size / 1024)} KB)
                  </div>
                )}
                
                {/* Upload progress */}
                {uploadingBwr && (
                  <div className="w-full">
                    <Progress value={uploadProgressBwr} className="h-2" />
                    <div className="text-xs text-right mt-1">{uploadProgressBwr}%</div>
                  </div>
                )}
              </div>
            </div>

            {/* Fetch header button */}
            <div className="flex justify-end mb-4">
              <Button
                variant="default"
                className="gap-2 bg-gradient-to-r from-violet-500 via-purple-400 to-blue-400 hover:from-violet-600 hover:to-blue-500 shadow"
                onClick={fetchHeader1}
                disabled={loading1 || uploadingBwr}
              >
                <Download className="w-5 h-5" />
                {loading1 ? "Loading..." : "Fetch Header"}
              </Button>
            </div>
            
            {header1 && header1.length > 0 && (
              <div className="space-y-4">
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
          </Card>

          {/* ADSR File Section */}
          <Card className="p-6 bg-green-50/50 border-green-200 shadow">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-2 mb-6">
              <div className="flex items-center space-x-3">
                <FileText size={32} className="text-teal-700" />
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                  ADSR file data
                </h1>
              </div>

              {/* New file upload section */}
              <div className="flex flex-col w-full space-y-2 sm:w-auto">
                <div className="flex items-center gap-2">
                  <Input 
                    id="adsr-file" 
                    type="file" 
                    accept=".csv,.txt,.xls,.xlsx"
                    onChange={handleAdsrFileChange}
                    disabled={uploadingAdsr}
                    className="max-w-xs text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={uploadAdsrFile}
                    disabled={!adsrFile || uploadingAdsr}
                    className="whitespace-nowrap"
                  >
                    <ArrowUp className="w-4 h-4 mr-1" />
                    Upload
                  </Button>
                </div>
                
                {/* Display selected file name */}
                {adsrFile && (
                  <div className="text-sm text-gray-600 font-medium">
                    {adsrFile.name} ({Math.round(adsrFile.size / 1024)} KB)
                  </div>
                )}
                
                {/* Upload progress */}
                {uploadingAdsr && (
                  <div className="w-full">
                    <Progress value={uploadProgressAdsr} className="h-2" />
                    <div className="text-xs text-right mt-1">{uploadProgressAdsr}%</div>
                  </div>
                )}
              </div>
            </div>

            {/* Fetch header button */}
            <div className="flex justify-end mb-4">
              <Button
                variant="default"
                className="gap-2 bg-gradient-to-r from-teal-500 via-green-400 to-emerald-400 hover:from-teal-600 hover:to-emerald-500 shadow"
                onClick={fetchHeader2}
                disabled={loading2 || uploadingAdsr}
              >
                <Download className="w-5 h-5" />
                {loading2 ? "Loading..." : "Fetch Header"}
              </Button>
            </div>
            
            {header2 && header2.length > 0 && (
              <div className="space-y-4">
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
          </Card>
        </div>

        {/* Calculation Controls Section */}
        {header1 && header2 && (
          <Card className="p-4 bg-violet-50 border-violet-200 shadow">
            <h2 className="text-lg font-bold mb-4 text-center">Data Calculations</h2>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">BWR Column:</span>
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
              </div>

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

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">ADSR Column:</span>
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
            </div>
          </Card>
        )}

        {/* Combined Table Display */}
        <BwrTable
          header1={header1}
          header2={header2}
          data1={dataForDisplay1}
          data2={dataForDisplay2}
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
