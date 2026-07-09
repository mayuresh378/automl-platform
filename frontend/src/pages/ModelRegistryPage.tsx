import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ChevronDown, ChevronUp, Trash2, BarChart3, ExternalLink } from 'lucide-react';
import { api } from '../lib/api';

function ModelRegistryPage() {
  const [models, setModels] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);

  const load = () => api.models.list().then(r => setModels(r.models)).catch(() => {});

  useEffect(() => { load(); }, []);

  const openDetail = async (name: string) => {
    if (selected === name) { setSelected(null); setDetail(null); return; }
    setSelected(name);
    try {
      const d = await api.models.detail(name);
      setDetail(d);
    } catch { setDetail(null); }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Delete model "${name}"?`)) return;
    try {
      await api.models.remove(name);
      if (selected === name) { setSelected(null); setDetail(null); }
      load();
    } catch (err: any) { alert(err.message); }
  };

  const metrics = detail?.metrics;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Model repository</p>
            <h2 className="text-2xl font-semibold text-white">Trained models library</h2>
          </div>
          <div className="rounded-2xl bg-white/10 px-3 py-1 text-sm text-slate-300">{models.length} models</div>
        </div>

        {models.length === 0 && (
          <div className="py-16 text-center text-sm text-slate-500">No models trained yet.</div>
        )}

        <div className="space-y-3">
          {models.map((model: any) => (
            <div key={model.name} className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <Package className="h-5 w-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{model.name}</p>
                    <p className="text-xs text-slate-400">{model.task_type || '—'} &middot; {model.size_kb} KB</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{model.best_score ?? '—'}</p>
                    <p className="text-xs text-slate-400">score</p>
                  </div>
                  <button className="rounded-xl bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20" onClick={() => openDetail(model.name)}>
                    {selected === model.name ? 'Close' : 'Details'}
                  </button>
                  <button className="rounded-xl bg-red-500/10 px-3 py-1 text-xs text-red-400 hover:bg-red-500/20" onClick={() => handleDelete(model.name)}>
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {selected === model.name && detail && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/10 px-5 py-4 space-y-4">
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-2xl border border-white/10 bg-[#111827]/70 p-3">
                        <p className="text-xs text-slate-400">Best params</p>
                        <p className="text-xs text-white font-mono mt-1">{JSON.stringify(detail.best_params || {})}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-[#111827]/70 p-3">
                        <p className="text-xs text-slate-400">CV score</p>
                        <p className="text-sm font-medium text-white">{detail.cv_score ?? '—'}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-[#111827]/70 p-3">
                        <p className="text-xs text-slate-400">Training time</p>
                        <p className="text-sm font-medium text-white">{detail.training_time ?? '—'}s</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-[#111827]/70 p-3">
                        <p className="text-xs text-slate-400">Test set</p>
                        <p className="text-sm font-medium text-white">{detail.test_size ?? '—'} rows</p>
                      </div>
                    </div>

                    {metrics && (
                      <div>
                        <p className="text-xs font-medium text-slate-400 mb-2">Metrics</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(metrics).filter(([k]) => k !== 'confusion_matrix').map(([key, val]) => (
                            <span key={key} className="rounded-xl bg-primary/10 px-3 py-1 text-xs text-white">
                              {key}: {typeof val === 'number' ? val.toFixed(4) : String(val)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {detail.feature_importance && detail.feature_importance.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-slate-400 mb-2">Feature importance</p>
                        <div className="space-y-1">
                          {detail.feature_importance.slice(0, 10).map((fi: any) => (
                            <div key={fi.feature} className="flex items-center gap-3">
                              <span className="text-xs text-white w-40 truncate">{fi.feature}</span>
                              <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${Math.min(100, fi.importance * 20)}%` }} />
                              </div>
                              <span className="text-xs text-slate-400 w-12 text-right">{fi.importance.toFixed(4)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

export default ModelRegistryPage;
