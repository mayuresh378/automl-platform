import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudUpload, FileSpreadsheet, CheckCircle2, Sparkles, DatabaseZap, AlertCircle, Search, Eye, Trash2, Table, BarChart3, Columns, HardDrive, Download, Upload, FileWarning, Loader2, FileText, FileType, Clock, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { api, downloadUrl } from '../lib/api';
import { useUIStore } from '../store/useUIStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { staggerContainer, staggerItem } from '../lib/animations';

function UploadPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [search, setSearch] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [previewDs, setPreviewDs] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewOffset, setPreviewOffset] = useState(0);
  const [metadataOpen, setMetadataOpen] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const setActivePage = useUIStore((s) => s.setActivePage);
  const notify = useNotificationStore((s) => s.add);

  const load = () => api.datasets.list().then(r => setDatasets(r.datasets)).catch(() => {});

  useEffect(() => { load(); }, []);

  const ALLOWED_EXTS = ['.csv', '.xlsx', '.xls', '.parquet', '.json'];
  const MAX_SIZE = 500 * 1024 * 1024;

  const validateFile = (file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) return `Unsupported file type "${ext}". Allowed: ${ALLOWED_EXTS.join(', ')}`;
    if (file.size === 0) return 'File is empty';
    if (file.size > MAX_SIZE) return `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max: 500 MB`;
    const dup = datasets.find((d: any) => d.name === file.name);
    if (dup) return `"${file.name}" already exists. Delete it first or rename the file.`;
    return null;
  };

  const doUpload = async (file: File) => {
    setValidationError('');
    const err = validateFile(file);
    if (err) { setValidationError(err); return; }
    setUploading(true);
    setUploadProgress(0);
    setFeedback(null);
    const interval = setInterval(() => setUploadProgress(p => Math.min(p + 10, 90)), 300);
    try {
      const res = await api.datasets.upload(file);
      clearInterval(interval);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);
      setFeedback({ type: 'success', msg: `Uploaded "${file.name}" successfully` });
      notify({ title: 'Dataset uploaded', message: `${file.name} (${(file.size / 1024).toFixed(1)} KB)`, type: 'success' });
      await load();
    } catch (err: any) {
      clearInterval(interval);
      setUploadProgress(0);
      setFeedback({ type: 'error', msg: err.message || 'Upload failed' });
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await doUpload(file);
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await doUpload(file);
  }, [datasets]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); };

  const handleDelete = async (name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await api.datasets.remove(name);
      setFeedback({ type: 'success', msg: `Deleted "${name}"` });
      notify({ title: 'Dataset deleted', message: `"${name}" removed from storage`, type: 'info' });
      if (previewDs === name) { setPreviewDs(null); setPreviewData(null); }
      await load();
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err.message || 'Delete failed' });
    }
  };

  const openPreview = async (name: string) => {
    setPreviewDs(name);
    setPreviewOffset(0);
    try {
      const data = await api.datasets.preview(name, 100, 0);
      setPreviewData(data);
    } catch {
      setPreviewData(null);
    }
  };

  const closePreview = () => { setPreviewDs(null); setPreviewData(null); };

  const previewPrev = async () => {
    if (!previewDs || previewOffset < 100) return;
    const newOff = previewOffset - 100;
    setPreviewOffset(newOff);
    const data = await api.datasets.preview(previewDs, 100, newOff);
    setPreviewData(data);
  };

  const previewNext = async () => {
    if (!previewDs || !previewData) return;
    const newOff = previewOffset + 100;
    setPreviewOffset(newOff);
    const data = await api.datasets.preview(previewDs, 100, newOff);
    setPreviewData(data);
  };

  const filtered = datasets.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
  const totalRows = datasets.reduce((s, d) => s + (d.rows || 0), 0);
  const totalCols = datasets.reduce((s, d) => s + (d.columns?.length || 0), 0);
  const totalSize = datasets.reduce((s, d) => s + (d.size_kb || 0), 0);

  const extColor = (ext: string) => {
    const map: Record<string, string> = {
      '.csv': 'text-emerald-400 bg-emerald-500/10',
      '.xlsx': 'text-blue-400 bg-blue-500/10',
      '.xls': 'text-blue-400 bg-blue-500/10',
      '.parquet': 'text-purple-400 bg-purple-500/10',
      '.json': 'text-amber-400 bg-amber-500/10',
    };
    return map[ext] || 'text-slate-400 bg-white/10';
  };

  const fmtDate = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const previewCols = previewData?.columns || [];
  const previewRows = previewData?.data || [];

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem} className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total datasets', value: datasets.length, icon: DatabaseZap },
          { label: 'Total rows', value: totalRows.toLocaleString(), icon: Table },
          { label: 'Total columns', value: totalCols, icon: Columns },
          { label: 'Storage used', value: totalSize > 1024 ? `${(totalSize / 1024).toFixed(1)} MB` : `${totalSize.toFixed(1)} KB`, icon: HardDrive },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card-hover rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">{stat.label}</span>
                <Icon className="h-4 w-4 text-accent" />
              </div>
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
            </div>
          );
        })}
      </motion.div>

      <motion.section variants={staggerItem} className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-8">
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
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`cursor-pointer rounded-[28px] border-2 border-dashed p-10 text-center transition-all ${
              dragOver
                ? 'border-accent bg-accent/10'
                : uploading
                ? 'border-primary/30 bg-primary/10'
                : 'border-primary/30 bg-gradient-to-br from-primary/10 via-transparent to-accent/10'
            }`}
            onClick={() => !uploading && inputRef.current?.click()}
          >
            <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full transition-all ${dragOver ? 'bg-accent/20 scale-110' : 'bg-white/10'}`}>
              {uploading ? <Loader2 className="h-8 w-8 text-accent animate-spin" /> : dragOver ? <Upload className="h-8 w-8 text-accent" /> : <DatabaseZap className="h-8 w-8 text-accent" />}
            </div>
            <h3 className="text-xl font-semibold text-white">
              {uploading ? `Uploading... ${uploadProgress}%` : dragOver ? 'Drop to upload' : 'Drop files here or click to browse'}
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">CSV, Excel, Parquet, and JSON datasets supported (max 500MB).</p>
            {uploading && (
              <div className="mx-auto mt-4 max-w-xs h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-accent to-emerald-400"
                />
              </div>
            )}
            {validationError && (
              <div className="mx-auto mt-4 max-w-md flex items-center gap-2 rounded-2xl bg-red-500/10 px-4 py-2 text-xs text-red-400">
                <FileWarning className="h-3.5 w-3.5 shrink-0" />
                {validationError}
              </div>
            )}
            <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls,.parquet,.json" className="hidden" onChange={handleUpload} disabled={uploading} />
          </div>
        </div>

        <div className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
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
            {filtered.map((ds: any) => {
              const ext = '.' + ds.name.split('.').pop()?.toLowerCase();
              return (
                <div key={ds.name} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileSpreadsheet className="h-5 w-5 text-primary shrink-0" />
                      <p className="text-sm font-medium text-white truncate">{ds.name}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${extColor(ext)}`}>{ext.replace('.', '').toUpperCase()}</span>
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] text-emerald-400">Ready</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 ml-8 mb-1.5">
                    <span>{ds.size_kb >= 1024 ? `${(ds.size_kb / 1024).toFixed(1)} MB` : `${ds.size_kb} KB`}</span>
                    <span>{ds.rows?.toLocaleString()} rows</span>
                    <span>{ds.columns?.length} columns</span>
                    {ds.uploaded_at && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {fmtDate(ds.uploaded_at)}
                      </span>
                    )}
                  </div>
                  {ds.columns && ds.columns.length > 0 && (
                    <div className="flex flex-wrap gap-1 ml-8 mb-1.5">
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
                      onClick={() => openPreview(ds.name)}
                      className="btn-press flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors"
                    >
                      <Eye className="h-3 w-3" /> Preview
                    </button>
                    <button
                      onClick={() => setMetadataOpen(metadataOpen === ds.name ? null : ds.name)}
                      className="btn-press flex items-center gap-1 text-[11px] text-slate-400 hover:text-zinc-200 transition-colors"
                    >
                      <FileText className="h-3 w-3" /> Meta
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
                  {metadataOpen === ds.name && ds.dtypes && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} className="mt-2 ml-8 overflow-hidden"
                    >
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 space-y-1">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Column types</p>
                        {Object.entries(ds.dtypes).slice(0, 8).map(([col, dt]: [string, any]) => (
                          <div key={col} className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 truncate mr-2">{col}</span>
                            <span className="text-slate-500 shrink-0">{dt}</span>
                          </div>
                        ))}
                        {Object.keys(ds.dtypes).length > 8 && (
                          <p className="text-[10px] text-slate-600">+{Object.keys(ds.dtypes).length - 8} more</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      <AnimatePresence>
        {previewDs && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={closePreview}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="card-hover rounded-[32px] border border-white/10 bg-[#111827] w-full max-w-5xl max-h-[85vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 pb-4">
                <div>
                  <p className="text-sm text-slate-400">Data preview</p>
                  <h3 className="text-xl font-semibold text-white">{previewDs}</h3>
                </div>
                <button onClick={closePreview} className="rounded-full p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-auto px-6 pb-4">
                {previewData ? (
                  <>
                    <div className="overflow-auto rounded-3xl border border-white/10 max-h-[55vh]">
                      <table className="min-w-full divide-y divide-white/10 text-sm">
                        <thead className="bg-white/5 text-left text-slate-400 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 whitespace-nowrap text-[10px] uppercase tracking-wider w-10">#</th>
                            {previewCols.map((col: string) => (
                              <th key={col} className="px-4 py-3 whitespace-nowrap">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10 text-slate-300">
                          {previewRows.map((row: any, i: number) => (
                            <tr key={i} className="hover:bg-white/5">
                              <td className="px-4 py-2.5 whitespace-nowrap text-slate-600 text-[10px]">{previewOffset + i + 1}</td>
                              {previewCols.map((col: string) => {
                                const val = row[col];
                                return (
                                  <td key={col} className="px-4 py-2.5 whitespace-nowrap max-w-[220px] truncate" title={val != null ? String(val) : ''}>
                                    {val != null && val !== '' ? String(val) : <span className="text-slate-600 italic">null</span>}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-slate-500">
                        Showing {previewOffset + 1}–{Math.min(previewOffset + 100, previewData.total_rows)} of {previewData.total_rows.toLocaleString()} rows
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={previewPrev}
                          disabled={previewOffset < 100}
                          className="btn-press rounded-full border border-white/10 p-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={previewNext}
                          disabled={previewOffset + 100 >= previewData.total_rows}
                          className="btn-press rounded-full border border-white/10 p-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center py-16 text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading preview...
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default UploadPage;
