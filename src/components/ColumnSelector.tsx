
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ListCheck } from "lucide-react";

interface ColumnSelectorProps {
  columns: string[];
  selected: string[];
  onChange: (columns: string[]) => void;
  disabled?: boolean;
}

export default function ColumnSelector({
  columns,
  selected,
  onChange,
  disabled,
}: ColumnSelectorProps) {
  // Local state unnecessary, immediate lift to parent
  const handleToggle = (col: string) => {
    if (selected.includes(col)) {
      onChange(selected.filter((c) => c !== col));
    } else {
      onChange([...selected, col]);
    }
  };

  // "Select all" and "Clear all" helpers
  const selectAll = () => onChange([...columns]);
  const clearAll = () => onChange([]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          aria-label="Select columns"
        >
          <ListCheck className="w-5 h-5" />
          {selected.length === 0
            ? "No columns selected"
            : selected.length === columns.length
            ? "All columns"
            : `${selected.length} selected`}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="z-50 min-w-[160px]">
        <DropdownMenuLabel>Show columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((col) => (
          <DropdownMenuCheckboxItem
            key={col}
            checked={selected.includes(col)}
            onCheckedChange={() => handleToggle(col)}
          >
            {col}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={selectAll}>Select All</DropdownMenuItem>
        <DropdownMenuItem onClick={clearAll}>Clear All</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
