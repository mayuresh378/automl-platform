import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Database, Table2, Columns3, ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '../../../lib/cn';

interface ColumnSchema { name: string; type: string; }
interface TableSchema { name: string; columns: ColumnSchema[]; }

interface SchemaExplorerProps {
  datasets: { name: string }[];
  onTableClick: (tableName: string) => void;
  onColumnClick: (columnName: string) => void;
  editorRef?: any;
  className?: string;
}

export const SchemaExplorer = memo(function SchemaExplorer({ datasets, onTableClick, onColumnClick, className }: SchemaExplorerProps) {
  const [search, setSearch] = useState('');
  const [expandedDatasets, setExpandedDatasets] = useState<Set<string>>(new Set());
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());

  const inferredSchema = datasets.map((d) => ({
    name: d.name.replace(/\.\w+$/, ''),
    tables: [{ name: d.name.replace(/\.\w+$/, ''), columns: [] as ColumnSchema[] }],
  }));

  const filtered = inferredSchema.filter((s) =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.tables.some((t) => t.name.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleDataset = (name: string) => setExpandedDatasets((prev) => {
    const next = new Set(prev);
    next.has(name) ? next.delete(name) : next.add(name);
    return next;
  });

  const toggleTable = (name: string) => setExpandedTables((prev) => {
    const next = new Set(prev);
    next.has(name) ? next.delete(name) : next.add(name);
    return next;
  });

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="px-3 py-2.5 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Schema Explorer</span>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schema..."
            className="w-full h-7 pl-7 pr-2 rounded-md bg-white/[0.05] border border-border text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin py-1">
        {filtered.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-zinc-600">No datasets found</div>
        ) : (
          filtered.map((schema) => (
            <div key={schema.name}>
              <button
                onClick={() => toggleDataset(schema.name)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-sidebar-hover transition-colors"
              >
                {expandedDatasets.has(schema.name) ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />}
                <Database className="w-3.5 h-3.5 shrink-0 text-primary/70" />
                <span className="truncate font-medium">{schema.name}</span>
              </button>
              <AnimatePresence>
                {expandedDatasets.has(schema.name) && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    {schema.tables.map((table) => (
                      <div key={table.name}>
                        <button
                          onClick={() => { toggleTable(table.name); onTableClick(table.name); }}
                          className="w-full flex items-center gap-2 pl-7 pr-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-sidebar-hover transition-colors"
                        >
                          {expandedTables.has(table.name) ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />}
                          <Table2 className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
                          <span className="truncate font-medium">{table.name}</span>
                        </button>
                        <AnimatePresence>
                          {expandedTables.has(table.name) && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <button
                                onClick={() => onColumnClick('*')}
                                className="w-full flex items-center gap-2 pl-10 pr-3 py-1 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-sidebar-hover transition-colors italic"
                              >
                                <Columns3 className="w-3 h-3 shrink-0" />
                                * (all columns)
                              </button>
                              {[
                                { name: 'id', type: 'INTEGER' },
                                { name: 'name', type: 'VARCHAR' },
                                { name: 'value', type: 'DOUBLE' },
                                { name: 'created_at', type: 'TIMESTAMP' },
                              ].map((col) => (
                                <button
                                  key={col.name}
                                  onClick={() => onColumnClick(col.name)}
                                  className="w-full flex items-center gap-2 pl-10 pr-3 py-1 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-sidebar-hover transition-colors"
                                >
                                  <Columns3 className="w-3 h-3 shrink-0" />
                                  <span>{col.name}</span>
                                  <span className="text-[10px] text-zinc-600 ml-auto">{col.type}</span>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  );
});
