import { useState, useMemo, memo, useCallback } from 'react';
import {
  useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel,
  flexRender, createColumnHelper, SortingState, ColumnFiltersState,
} from '@tanstack/react-table';
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown,
  Download, Copy, Check, Search, Table2, Clock,
} from 'lucide-react';
import { cn } from '../../../lib/cn';
import { sqlService } from '../services/sqlEditor.service';
import { QueryResult } from '../types';

interface ResultsGridProps {
  result: QueryResult;
}

export const ResultsGrid = memo(function ResultsGrid({ result }: ResultsGridProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [copiedCell, setCopiedCell] = useState<string | null>(null);
  const [rowSize, setRowSize] = useState<'compact' | 'comfortable'>('compact');

  const columns = useMemo(() => {
    return result.columns.map((col) => ({
      accessorKey: col,
      header: col,
      cell: (info: any) => {
        const val = info.getValue();
        return val != null ? String(val) : null;
      },
      size: 150,
    }));
  }, [result.columns]);

  const data = useMemo(() => result.data, [result.data]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 50 } },
  });

  const copyCell = useCallback(async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedCell(value);
      setTimeout(() => setCopiedCell(null), 1500);
    } catch {}
  }, []);

  const copyRow = useCallback(async (row: Record<string, any>) => {
    const text = Object.values(row).join('\t');
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  }, []);

  const copyTable = useCallback(async () => {
    const header = result.columns.join('\t');
    const rows = result.data.map((r) => result.columns.map((c) => r[c] ?? '').join('\t')).join('\n');
    try { await navigator.clipboard.writeText(`${header}\n${rows}`); } catch {}
  }, [result]);

  const handleExportCSV = useCallback(() => {
    sqlService.exportCSV(result.data, `query_export_${Date.now()}`);
  }, [result.data]);

  const handleExportJSON = useCallback(() => {
    sqlService.exportJSON(result.data, `query_export_${Date.now()}`);
  }, [result.data]);

  const rowHeight = rowSize === 'compact' ? 'h-8' : 'h-10';

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-card/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Table2 className="w-3.5 h-3.5" />
            <span>{result.rows} row{result.rows !== 1 ? 's' : ''}</span>
          </div>
          {result.executionTime && (
            <div className="flex items-center gap-1 text-xs text-zinc-500">
              <Clock className="w-3 h-3" />
              {result.executionTime}ms
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" />
            <input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Filter..."
              className="h-6 w-32 pl-6 pr-2 rounded text-[11px] bg-white/[0.05] border border-border text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-primary/50"
            />
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => setRowSize(rowSize === 'compact' ? 'comfortable' : 'compact')} className="grid-btn text-[10px] px-1.5">
              {rowSize === 'compact' ? 'Cmf' : 'Cpt'}
            </button>
            <button onClick={copyTable} className="grid-btn" title="Copy table">
              <Copy className="w-3 h-3" />
            </button>
            <button onClick={handleExportCSV} className="grid-btn" title="Export CSV">
              <Download className="w-3 h-3" /> CSV
            </button>
            <button onClick={handleExportJSON} className="grid-btn" title="Export JSON">
              <Download className="w-3 h-3" /> JSON
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                <th className="w-10 px-2 py-1.5 bg-card border-b border-border text-left text-[10px] text-zinc-500 font-medium">
                  #
                </th>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-2 py-1.5 bg-card border-b border-border text-left text-[10px] text-zinc-500 font-medium whitespace-nowrap cursor-pointer select-none hover:text-zinc-300"
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ width: header.getSize() }}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' ? <ArrowUp className="w-3 h-3" /> :
                       header.column.getIsSorted() === 'desc' ? <ArrowDown className="w-3 h-3" /> :
                       <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, idx) => (
              <tr
                key={row.id}
                className={cn(
                  'border-b border-border/50 hover:bg-white/[0.02] transition-colors',
                  idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.015]',
                )}
              >
                <td className={cn('px-2 text-[10px] text-zinc-600 font-mono', rowHeight)}>
                  {row.index + 1 + table.getState().pagination.pageIndex * table.getState().pagination.pageSize}
                </td>
                {row.getVisibleCells().map((cell) => {
                  const val = cell.getValue();
                  return (
                    <td
                      key={cell.id}
                      className={cn('px-2 font-mono cursor-pointer group relative', rowHeight)}
                      onClick={() => val != null && copyCell(String(val))}
                      title={val != null ? String(val) : 'NULL'}
                    >
                      <span className={cn(
                        'text-[11px]',
                        val == null ? 'text-zinc-600 italic' : 'text-zinc-300',
                        typeof val === 'number' ? 'text-emerald-400' : '',
                      )}>
                        {val != null ? String(val) : 'NULL'}
                      </span>
                      {copiedCell === String(val) && (
                        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-emerald-400">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-3 py-1.5 border-t border-border bg-card/50 shrink-0">
        <div className="text-[11px] text-zinc-500">
          {table.getFilteredRowModel().rows.length} of {result.data.length} rows
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} className="grid-btn">
            <ChevronsLeft className="w-3 h-3" />
          </button>
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="grid-btn">
            <ChevronLeft className="w-3 h-3" />
          </button>
          <span className="text-[11px] text-zinc-500 px-2">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="grid-btn">
            <ChevronRight className="w-3 h-3" />
          </button>
          <button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} className="grid-btn">
            <ChevronsRight className="w-3 h-3" />
          </button>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="h-6 rounded text-[11px] bg-white/[0.05] border border-border text-zinc-400 px-1 focus:outline-none"
          >
            {[20, 50, 100, 200].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <style>{`
        .grid-btn {
          display: inline-flex; align-items: center; gap: 2px;
          height: 22px; padding: 0 4px; border-radius: 4px;
          font-size: 11px; color: #a1a1aa; cursor: pointer;
          transition: all 0.15s; border: none; background: transparent;
        }
        .grid-btn:hover { background: rgba(255,255,255,0.05); color: #e4e4e7; }
        .grid-btn:disabled { opacity: 0.3; cursor: not-allowed; }
      `}</style>
    </div>
  );
});
