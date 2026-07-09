import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wand2, PlusCircle, Bot, Sparkles } from 'lucide-react';
import { api } from '../lib/api';

function EngineeringPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selected, setSelected] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    api.datasets.list().then(r => setDatasets(r.datasets)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selected) { setSuggestions([]); return; }
    api.datasets.suggestFeatures(selected).then(r => setSuggestions(r.suggestions)).catch(() => {});
  }, [selected]);

  const handleGenerate = async (ops: any[]) => {
    if (!selected) return;
    setRunning(true);
    setResult(null);
    try {
      const res = await api.datasets.generateFeatures(selected, ops);
      setResult(res);
      api.datasets.suggestFeatures(selected).then(r => setSuggestions(r.suggestions)).catch(() => {});
    } catch (err: any) { alert(err.message); }
    setRunning(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Feature intelligence</p>
            <h2 className="text-2xl font-semibold text-white">Craft high-signal features with AI assistance</h2>
          </div>
        </div>

        <div className="mb-4">
          <select className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none" value={selected} onChange={e => setSelected(e.target.value)}>
            <option value="">Select a dataset...</option>
            {datasets.map((d: any) => <option key={d.name} value={d.name}>{d.name}</option>)}
          </select>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-200">
              <Wand2 className="h-4 w-4 text-primary" />
              Suggested transforms
            </div>
            <div className="space-y-3">
              {suggestions.length === 0 && (
                <p className="text-sm text-slate-500">Select a dataset to see suggestions</p>
              )}
              {suggestions.map((s: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#111827]/70 px-4 py-3 text-sm text-slate-300">
                  <span>{s.description}</span>
                  <button className="rounded-xl bg-primary/20 px-3 py-1 text-xs text-white" onClick={() => handleGenerate([s])} disabled={running}>
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-accent/10 to-primary/10 p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-200">
              <Bot className="h-4 w-4 text-accent" />
              {result ? 'Generated features' : 'Copilot recommendation'}
            </div>
            {result ? (
              <div className="space-y-2">
                <p className="text-sm text-slate-300">{result.new_columns} new features created</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {result.generated_features.map((f: string) => (
                    <span key={f} className="rounded-xl bg-white/10 px-3 py-1 text-xs text-slate-300 font-mono">{f}</span>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-2">Saved as <span className="text-primary">{result.enhanced_file}</span></p>
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-300">Select a dataset and generate features to improve model performance.</p>
                <button className="mt-4 w-full rounded-2xl bg-primary/30 px-4 py-3 text-sm font-medium text-white hover:bg-primary/40 disabled:opacity-50"
                  onClick={() => handleGenerate(suggestions)} disabled={!selected || running || suggestions.length === 0}>
                  {running ? 'Generating...' : 'Generate all suggested features'}
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {result && (
        <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Feature store</p>
              <h3 className="text-lg font-semibold text-white">Generated features</h3>
            </div>
            <Sparkles className="h-5 w-5 text-accent" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {result.generated_features.map((f: string) => (
              <div key={f} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-medium text-white font-mono">{f}</p>
                <p className="mt-2 text-sm text-slate-400">Ready for training</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}

export default EngineeringPage;
