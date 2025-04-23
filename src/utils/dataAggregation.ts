type DataRow = Record<string, string | number>;

export const aggregateData = (
  data: DataRow[],
  pivotColumn: string,
  columns: string[]
): DataRow[] => {
  if (!data || !pivotColumn) return data;

  // Group data by pivot column
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
        // Keep the pivot column value as is
        aggregatedRow[column] = key;
      } else {
        // Try to sum if numeric, otherwise use first value
        const values = rows.map(row => row[column]);
        const numericValues = values.map(v => 
          typeof v === 'number' ? v : parseFloat(v?.toString() || '0')
        ).filter(v => !isNaN(v));
        
        if (numericValues.length > 0) {
          // Sum numeric values
          aggregatedRow[column] = numericValues.reduce((sum, val) => sum + val, 0);
        } else {
          // Use first non-empty value for non-numeric fields
          aggregatedRow[column] = values.find(v => v !== undefined && v !== '') || '';
        }
      }
    });
    
    return aggregatedRow;
  });
};
