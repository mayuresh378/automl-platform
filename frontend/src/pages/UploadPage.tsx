import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CloudUpload, FileSpreadsheet, CheckCircle2, Sparkles, DatabaseZap, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

function UploadPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      await load();
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err.message || 'Upload failed' });
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
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
          <div className="space-y-3">
            {datasets.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-8">No datasets uploaded yet</p>
            )}
            {datasets.map((ds: any) => (
              <div key={ds.name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-white">{ds.name}</p>
                    <p className="text-xs text-slate-400">{ds.size_kb} KB &middot; {ds.rows} rows &middot; {ds.columns?.length} cols</p>
                  </div>
                </div>
                <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">Ready</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}

export default UploadPage;
