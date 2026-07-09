import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, SlidersHorizontal, RefreshCw, CheckCircle2, Undo2 } from 'lucide-react';
import { api } from '../lib/api';

function CleaningPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selected, setSelected] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    api.datasets.list().then(r => setDatasets(r.datasets)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selected) { setProfile(null); return; }
    api.datasets.profile(selected).then(setProfile).catch(() => setProfile(null));
  }, [selected]);

  const handleClean = async (ops: any[]) => {
    if (!selected) return;
    setRunning(true);
    setResult(null);
    try {
      const res = await api.datasets.clean(selected, ops);
      setResult(res);
    } catch (err: any) { alert(err.message); }
    setRunning(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Data engineering</p>
            <h2 className="text-2xl font-semibold text-white">Clean and transform your dataset with confidence</h2>
          </div>
        </div>

        <div className="mb-4">
          <select className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none" value={selected} onChange={e => setSelected(e.target.value)}>
            <option value="">Select a dataset...</option>
            {datasets.map((d: any) => <option key={d.name} value={d.name}>{d.name}</option>)}
          </select>
        </div>

        {profile && (
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Data quality score</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {profile.missing_pct < 5 ? '92' : profile.missing_pct < 15 ? '78' : '55'}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Missing values</p>
              <p className="mt-2 text-2xl font-semibold text-white">{profile.missing_pct}%</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Duplicates</p>
              <p className="mt-2 text-2xl font-semibold text-white">{profile.duplicates}</p>
            </div>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-200">
              <Sparkles className="h-4 w-4 text-accent" />
              Recommended actions
            </div>
            <div className="space-y-3">
              {[
                { type: 'impute_missing', strategy: 'median', label: 'Impute missing values (median)', columns: [] },
                { type: 'encode_categorical', label: 'Encode categorical columns', columns: profile?.column_details?.filter((c: any) => c.dtype === 'object').map((c: any) => c.name) || [] },
                { type: 'scale_numeric', strategy: 'standard', label: 'Scale numeric features (standard)', columns: profile?.column_details?.filter((c: any) => c.dtype in ['int64', 'float64']).map((c: any) => c.name) || [] },
                { type: 'remove_outliers', label: 'Remove sparse outliers', columns: profile?.column_details?.filter((c: any) => c.outliers > 0).map((c: any) => c.name) || [] },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#111827]/70 px-4 py-3 text-sm text-slate-300">
                  <span>{item.label}</span>
                  <button className="rounded-xl bg-white/10 px-3 py-1 text-xs text-white" onClick={() => handleClean([item])} disabled={running}>
                    Apply
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-primary/10 to-accent/10 p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-200">
              <RefreshCw className="h-4 w-4 text-primary" />
              {result ? 'Cleaning result' : 'Preview summary'}
            </div>
            {result ? (
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3"><span>Rows after</span><span>{result.rows_after}</span></div>
                <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3"><span>Features retained</span><span>{result.columns_after}</span></div>
                <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3"><span>Saved as</span><span className="text-primary">{result.cleaned_file}</span></div>
              </div>
            ) : profile ? (
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3"><span>Rows</span><span>{profile.rows}</span></div>
                <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3"><span>Columns</span><span>{profile.columns}</span></div>
                <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3"><span>Missing</span><span>{profile.missing_pct}%</span></div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Select a dataset to see its profile</p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Pipeline</p>
              <h3 className="text-lg font-semibold text-white">All operations</h3>
            </div>
            <SlidersHorizontal className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-3">
            <button className="w-full rounded-2xl bg-primary/20 px-4 py-3 text-sm font-medium text-white hover:bg-primary/30 disabled:opacity-50"
              onClick={() => handleClean([
                { type: 'impute_missing', strategy: 'median', columns: [] },
                { type: 'encode_categorical', columns: profile?.column_details?.filter((c: any) => c.dtype === 'object').map((c: any) => c.name) || [] },
                { type: 'scale_numeric', strategy: 'standard', columns: profile?.column_details?.filter((c: any) => c.dtype in ['int64', 'float64']).map((c: any) => c.name) || [] },
                { type: 'remove_outliers', columns: profile?.column_details?.filter((c: any) => c.outliers > 0).map((c: any) => c.name) || [] },
              ])} disabled={!selected || running}>
              Apply full cleaning pipeline
            </button>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Recovery</p>
              <h3 className="text-lg font-semibold text-white">Versioning</h3>
            </div>
            <Undo2 className="h-5 w-5 text-accent" />
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            Cleaned datasets are saved as <code className="text-primary">cleaned_*.csv</code> in the dataset directory.
          </div>
        </div>
      </section>
    </motion.div>
  );
}

export default CleaningPage;
