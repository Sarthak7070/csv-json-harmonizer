
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Group } from "lucide-react";

interface PivotSelectorProps {
  columns: string[];
  selectedPivot: string;
  onChange: (column: string) => void;
  disabled?: boolean;
}

export default function PivotSelector({
  columns,
  selectedPivot,
  onChange,
  disabled,
}: PivotSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Group className="w-4 h-4" />
      <Select
        value={selectedPivot}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select pivot column" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">No pivot</SelectItem>
          {columns.map((column) => (
            <SelectItem key={column} value={column}>
              {column}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
