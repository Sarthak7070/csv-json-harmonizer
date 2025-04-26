type DataRow = Record<string, string | number>;

export const aggregateData = (
  data: DataRow[],
  pivotColumn: string,
  columns: string[]
): DataRow[] => {
  if (!data || !pivotColumn) return data;

  // Group data by pivot column (bill number)
  const groupedData = data.reduce((acc, row) => {
    const key = row[pivotColumn]?.toString() || '';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(row);
    return acc;
  }, {} as Record<string, DataRow[]>);

  // Aggregate each group
  return Object.entries(groupedData).map(([key, rows]) => {
    const aggregatedRow: DataRow = {};
    
    columns.forEach(column => {
      if (column === pivotColumn) {
        // Keep the bill number as is
        aggregatedRow[column] = key;
      } else {
        // Try to sum if numeric, otherwise concatenate unique values
        const values = rows.map(row => row[column]);
        const numericValues = values.map(v => 
          typeof v === 'number' ? v : parseFloat(v?.toString() || '0')
        ).filter(v => !isNaN(v));
        
        if (numericValues.length > 0) {
          // Sum numeric values
          const sum = numericValues.reduce((acc, val) => acc + val, 0);
          aggregatedRow[column] = Number(sum.toFixed(2)); // Round to 2 decimal places
        } else {
          // For non-numeric values, keep unique values joined by comma
          const uniqueValues = Array.from(new Set(values.filter(v => v !== undefined && v !== '')));
          aggregatedRow[column] = uniqueValues.join(', ');
        }
      }
    });
    
    return aggregatedRow;
  });
};
