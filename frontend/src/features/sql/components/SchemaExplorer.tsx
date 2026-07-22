import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Database, Table2, Columns3, ChevronRight, ChevronDown } from 'lucide-react';
import styles from './SchemaExplorer.module.css';

interface ColumnSchema { name: string; type: string; }
interface TableSchema { name: string; columns: ColumnSchema[]; }

interface SchemaExplorerProps {
  datasets: { name: string }[];
  onTableClick: (tableName: string) => void;
  onColumnClick: (columnName: string) => void;
  editorRef?: any;
  className?: string;
}

export const SchemaExplorer = memo(function SchemaExplorer({ datasets, onTableClick, onColumnClick }: SchemaExplorerProps) {
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
    <div className={styles.explorer}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <Database className={styles.headerIcon} />
          <span className={styles.headerText}>Schema Explorer</span>
        </div>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schema..."
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.tree}>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>No datasets found</div>
        ) : (
          filtered.map((schema) => (
            <div key={schema.name}>
              <button
                onClick={() => toggleDataset(schema.name)}
                className={styles.datasetNode}
              >
                {expandedDatasets.has(schema.name) ? <ChevronDown className={styles.datasetChevron} /> : <ChevronRight className={styles.datasetChevron} />}
                <Database className={styles.datasetIcon} />
                <span className={styles.datasetName}>{schema.name}</span>
              </button>
              <AnimatePresence>
                {expandedDatasets.has(schema.name) && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                    {schema.tables.map((table) => (
                      <div key={table.name}>
                        <button
                          onClick={() => { toggleTable(table.name); onTableClick(table.name); }}
                          className={styles.tableNode}
                        >
                          {expandedTables.has(table.name) ? <ChevronDown className={styles.tableChevron} /> : <ChevronRight className={styles.tableChevron} />}
                          <Table2 className={styles.tableIcon} />
                          <span className={styles.tableName}>{table.name}</span>
                        </button>
                        <AnimatePresence>
                          {expandedTables.has(table.name) && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                              <button
                                onClick={() => onColumnClick('*')}
                                className={`${styles.columnNode} ${styles.allColumns}`}
                              >
                                <Columns3 className={styles.columnIcon} />
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
                                  className={styles.columnNode}
                                >
                                  <Columns3 className={styles.columnIcon} />
                                  <span className={styles.columnName}>{col.name}</span>
                                  <span className={styles.columnType}>{col.type}</span>
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
