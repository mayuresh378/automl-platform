import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Database, Table2, RotateCcw, AlertCircle, ChevronDown, Download } from 'lucide-react';
import { api, downloadBlob } from '../lib/api';

function SQLEditorPage() {
  const [query, setQuery] = useState('SELECT * FROM data LIMIT 50');
  const [dataset, setDataset] = useState('');
  const [datasets, setDatasets] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    api.datasets.list().then(r => {
      setDatasets(r.datasets);
      if (r.datasets.length > 0) setDataset(r.datasets[0].name);
    }).catch(() => {});
  }, []);

  const runQuery = useCallback(async () => {
    if (!query.trim()) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/v1/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ query, dataset }).toString(),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Query failed');
      }
      const data = await res.json();
      setResult(data);
      setHistory(prev => [query, ...prev.filter(q => q !== query)].slice(0, 20));
    } catch (err: any) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [query, dataset]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">SQL Editor</p>
          <h2 className="text-2xl font-semibold text-white">Query your datasets</h2>
        </div>
      </div>

      <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-slate-400" />
            <select
              value={dataset}
              onChange={(e) => setDataset(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
            >
              {datasets.map((d: any) => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={runQuery}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            {loading ? 'Running…' : 'Run'}
          </button>
          <button
            onClick={() => setQuery('SELECT * FROM data LIMIT 50')}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>

        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[#0d1117] px-4 py-3 text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 resize-none"
            rows={6}
            placeholder="Enter SQL query…"
            spellCheck={false}
          />
          <div className="absolute bottom-3 right-3 text-xs text-slate-600">Ctrl+Enter to run</div>
        </div>
      </div>

      {error && (
        <div className="rounded-3xl border border-danger/20 bg-danger/5 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {result && (
          <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Table2 className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-white">Results ({result.rows} rows)</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-xs text-slate-500">{result.columns.length} columns</p>
                <button onClick={() => downloadBlob(result.data, 'query_results.csv')} className="flex items-center gap-1 rounded-xl border border-white/10 px-2.5 py-1 text-[11px] text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors">
                  <Download className="h-3 w-3" /> CSV
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {result.columns.map((col: string) => (
                      <th key={col} className="px-3 py-2 text-left text-xs font-medium text-slate-400 whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.data.map((row: any, i: number) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                      {result.columns.map((col: string) => (
                        <td key={col} className="px-3 py-2 text-sm text-zinc-300 whitespace-nowrap">{row[col] == null ? 'NULL' : String(row[col])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {history.length > 0 && (
            <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-5">
              <p className="text-xs font-medium text-slate-400 mb-3">Recent queries</p>
              <div className="space-y-2">
                {history.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(q)}
                    className="w-full text-left rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-xs font-mono text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors truncate"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-5">
            <p className="text-xs font-medium text-slate-400 mb-3">Quick examples</p>
            <div className="space-y-2">
              {[
                'SELECT * FROM data LIMIT 10',
                'SELECT COUNT(*) as cnt FROM data',
                'SELECT column, COUNT(*) FROM data GROUP BY column',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setQuery(q)}
                  className="w-full text-left rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-xs font-mono text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default SQLEditorPage;
