import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, SlidersHorizontal, BarChart3, ScanSearch } from 'lucide-react';
import { api } from '../lib/api';

function ExplorerPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selected, setSelected] = useState('');
  const [preview, setPreview] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.datasets.list().then(r => setDatasets(r.datasets)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selected) { setPreview(null); setProfile(null); return; }
    api.datasets.preview(selected).then(setPreview).catch(() => setPreview(null));
    api.datasets.profile(selected).then(setProfile).catch(() => setProfile(null));
  }, [selected]);

  const cols = preview?.columns || [];
  const rows = preview?.data || [];
  const filteredCols = cols.filter((c: string) => c.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-slate-400">Dataset profiling</p>
            <h2 className="text-2xl font-semibold text-white">Explore columns, distributions, and quality signals</h2>
          </div>
          <div className="flex items-center gap-3">
            <select className="rounded-2xl border border-white/10 bg-[#111827] px-4 py-2 text-sm text-white outline-none" value={selected} onChange={e => setSelected(e.target.value)}>
              <option value="">Select a dataset...</option>
              {datasets.map((d: any) => <option key={d.name} value={d.name}>{d.name}</option>)}
            </select>
          </div>
        </div>

        {profile && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Data quality score</p>
              <p className="mt-2 text-2xl font-semibold text-white">{profile.missing_pct < 5 ? '94' : profile.missing_pct < 15 ? '78' : '55'}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Missing values</p>
              <p className="mt-2 text-2xl font-semibold text-white">{profile.missing_pct}%</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Outliers flagged</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {profile.column_details?.reduce((s: number, c: any) => s + (c.outliers || 0), 0) || 0}
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Preview</p>
              <h3 className="text-lg font-semibold text-white">Interactive data table</h3>
            </div>
            <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
              <Search className="h-4 w-4" />
              <input className="bg-transparent outline-none" placeholder="Search column" value={search} onChange={e => setSearch(e.target.value)} />
            </label>
          </div>
          {preview ? (
            <div className="overflow-auto rounded-3xl border border-white/10 max-h-96">
              <table className="min-w-full divide-y divide-white/10 text-sm">
                <thead className="bg-white/5 text-left text-slate-400 sticky top-0">
                  <tr>
                    {filteredCols.map((col: string) => (
                      <th key={col} className="px-4 py-3 whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-slate-300">
                  {rows.slice(0, 10).map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-white/5">
                      {filteredCols.map((col: string) => (
                        <td key={col} className="px-4 py-3 whitespace-nowrap">{String(row[col] ?? '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="p-4 text-sm text-slate-500">
                Showing {Math.min(10, rows.length)} of {preview.total_rows} rows
              </p>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-500">
              Select a dataset to preview its contents
            </div>
          )}
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Insights</p>
              <h3 className="text-lg font-semibold text-white">Column statistics</h3>
            </div>
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {profile?.column_details?.filter((c: any) => !search || c.name.toLowerCase().includes(search.toLowerCase())).map((col: any) => (
              <div key={col.name} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-white">{col.name}</p>
                  <span className="text-xs text-slate-400">{col.dtype}</span>
                </div>
                {col.mean !== undefined ? (
                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
                    <span>mean: {col.mean}</span>
                    <span>std: {col.std}</span>
                    <span>outliers: {col.outliers}</span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">{col.unique_values} unique values</p>
                )}
              </div>
            ))}
            {(!profile || profile.column_details?.length === 0) && (
              <p className="text-sm text-slate-500 text-center py-8">No data available</p>
            )}
          </div>
        </div>
      </section>
    </motion.div>
  );
}

export default ExplorerPage;
