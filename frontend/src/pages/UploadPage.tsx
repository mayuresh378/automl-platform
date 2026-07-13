import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CloudUpload, FileSpreadsheet, CheckCircle2, Sparkles, DatabaseZap, AlertCircle, Search, Eye, Trash2, Table, BarChart3, Columns, HardDrive, Download } from 'lucide-react';
import { api, downloadUrl } from '../lib/api';
import { useUIStore } from '../store/useUIStore';
import { useNotificationStore } from '../store/useNotificationStore';

function UploadPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const setActivePage = useUIStore((s) => s.setActivePage);
  const notify = useNotificationStore((s) => s.add);

  const load = () => api.datasets.list().then(r => setDatasets(r.datasets)).catch(() => {});

  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setFeedback(null);
    try {
      const res = await api.datasets.upload(file);
      setFeedback({ type: 'success', msg: `Uploaded "${file.name}" successfully` });
      notify({ title: 'Dataset uploaded', message: `${file.name} uploaded (${(file.size / 1024).toFixed(1)} KB)`, type: 'success' });
      await load();
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err.message || 'Upload failed' });
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await api.datasets.remove(name);
      setFeedback({ type: 'success', msg: `Deleted "${name}"` });
      notify({ title: 'Dataset deleted', message: `"${name}" removed from storage`, type: 'info' });
      await load();
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err.message || 'Delete failed' });
    }
  };

  const filtered = datasets.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
  const totalRows = datasets.reduce((s, d) => s + (d.rows || 0), 0);
  const totalCols = datasets.reduce((s, d) => s + (d.columns?.length || 0), 0);
  const totalSize = datasets.reduce((s, d) => s + (d.size_kb || 0), 0);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total datasets', value: datasets.length, icon: DatabaseZap },
          { label: 'Total rows', value: totalRows.toLocaleString(), icon: Table },
          { label: 'Total columns', value: totalCols, icon: Columns },
          { label: 'Storage used', value: totalSize > 1024 ? `${(totalSize / 1024).toFixed(1)} MB` : `${totalSize.toFixed(1)} KB`, icon: HardDrive },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">{stat.label}</span>
                <Icon className="h-4 w-4 text-accent" />
              </div>
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-primary/15 p-3 text-primary">
              <CloudUpload className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Intelligent ingestion</p>
              <h2 className="text-2xl font-semibold text-white">Upload & validate datasets</h2>
            </div>
          </div>

          {feedback && (
            <div className={`mb-4 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm ${feedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {feedback.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {feedback.msg}
            </div>
          )}

          <div
            className="cursor-pointer rounded-[28px] border border-dashed border-primary/30 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 p-10 text-center"
            onClick={() => inputRef.current?.click()}
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
              <DatabaseZap className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-white">
              {uploading ? 'Uploading...' : 'Drop files here or click to browse'}
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">CSV, Excel, Parquet, and JSON datasets are supported.</p>
            <input ref={inputRef} type="file" accept=".csv,.xlsx,.parquet,.json" className="hidden" onChange={handleUpload} disabled={uploading} />
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Available datasets</p>
              <h3 className="text-lg font-semibold text-white">Server datasets</h3>
            </div>
            <Sparkles className="h-5 w-5 text-accent" />
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              placeholder="Search datasets..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-primary/40"
            />
          </div>
          <div className="space-y-2 max-h-[420px] overflow-y-auto scrollbar-thin pr-1">
            {filtered.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-8">{search ? 'No matching datasets' : 'No datasets uploaded yet'}</p>
            )}
            {filtered.map((ds: any) => (
              <div key={ds.name} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileSpreadsheet className="h-5 w-5 text-primary shrink-0" />
                    <p className="text-sm font-medium text-white truncate">{ds.name}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] text-emerald-400">Ready</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 ml-8 mb-2">
                  <span>{ds.size_kb} KB</span>
                  <span>{ds.rows} rows</span>
                  <span>{ds.columns?.length} columns</span>
                </div>
                {ds.columns && ds.columns.length > 0 && (
                  <div className="flex flex-wrap gap-1 ml-8 mb-2">
                    {ds.columns.slice(0, 6).map((c: string) => (
                      <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">{c}</span>
                    ))}
                    {ds.columns.length > 6 && (
                      <span className="text-[10px] text-slate-600">+{ds.columns.length - 6} more</span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2 ml-8">
                  <button
                    onClick={() => { setActivePage('Explorer'); }}
                    className="btn-press flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors"
                  >
                    <Eye className="h-3 w-3" /> Preview
                  </button>
                  <button
                    onClick={() => { setActivePage('Data Cleaning'); }}
                    className="btn-press flex items-center gap-1 text-[11px] text-slate-400 hover:text-zinc-200 transition-colors"
                  >
                    <BarChart3 className="h-3 w-3" /> Profile
                  </button>
                  <a href={downloadUrl(`/datasets/${encodeURIComponent(ds.name)}/download`)} download={ds.name} className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors">
                    <Download className="h-3 w-3" /> Download
                  </a>
                  <button
                    onClick={() => handleDelete(ds.name)}
                    className="btn-press flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}

export default UploadPage;
