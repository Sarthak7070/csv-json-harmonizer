
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

interface CalculationSectionProps {
  header1: string[] | null;
  header2: string[] | null;
  data1: Record<string, string>[] | null;
  data2: Record<string, string>[] | null;
}

export default function CalculationSection({
  header1,
  header2,
  data1,
  data2,
}: CalculationSectionProps) {
  const [selectedColumn1, setSelectedColumn1] = useState<string>("");
  const [selectedColumn2, setSelectedColumn2] = useState<string>("");
  const [operation, setOperation] = useState<string>("+");

  const calculateResults = () => {
    if (!data1 || !data2 || !selectedColumn1 || !selectedColumn2) return [];

    const maxLength = Math.max(data1.length, data2.length);
    const results = [];

    for (let i = 0; i < maxLength; i++) {
      const value1 = parseFloat(data1[i]?.[selectedColumn1] || "0");
      const value2 = parseFloat(data2[i]?.[selectedColumn2] || "0");
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
    <div className="flex-none w-[300px] px-4">
      <div className="space-y-4 mb-8">
        <Select value={selectedColumn1} onValueChange={setSelectedColumn1}>
          <SelectTrigger>
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
          <SelectTrigger>
            <SelectValue placeholder="Select operation" />
          </SelectTrigger>
          <SelectContent>
            {["+", "-", "*", "/"].map((op) => (
              <SelectItem key={op} value={op}>
                {op}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedColumn2} onValueChange={setSelectedColumn2}>
          <SelectTrigger>
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

      <Card className="p-4">
        <div className="text-sm font-medium mb-2">Results:</div>
        <div className="space-y-2">
          {calculateResults().map((result, index) => (
            <div
              key={index}
              className="p-2 bg-gray-50 rounded text-center"
            >
              {result}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
