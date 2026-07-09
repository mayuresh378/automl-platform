import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wand2, PlusCircle, Bot, Sparkles, Table, Sigma, Layers, ArrowRight, CheckCircle2, FunctionSquare, Workflow } from 'lucide-react';
import { api } from '../lib/api';

const TRANSFORM_META: Record<string, { icon: any; color: string }> = {
  polynomial: { icon: Sigma, color: 'text-purple-400' },
  interaction: { icon: Workflow, color: 'text-blue-400' },
  log: { icon: FunctionSquare, color: 'text-emerald-400' },
  bin: { icon: Layers, color: 'text-amber-400' },
  sqrt: { icon: FunctionSquare, color: 'text-cyan-400' },
};

function EngineeringPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selected, setSelected] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [selectedDs, setSelectedDs] = useState<any>(null);

  useEffect(() => {
    api.datasets.list().then(r => setDatasets(r.datasets)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selected) { setSuggestions([]); setSelectedDs(null); return; }
    const ds = datasets.find(d => d.name === selected);
    setSelectedDs(ds || null);
    api.datasets.suggestFeatures(selected).then(r => setSuggestions(r.suggestions)).catch(() => {});
  }, [selected, datasets]);

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

  const numericCols = selectedDs?.columns?.filter((c: string) => selectedDs.dtypes?.[c]?.includes('int') || selectedDs.dtypes?.[c]?.includes('float')) || [];
  const textCols = selectedDs?.columns?.filter((c: string) => selectedDs.dtypes?.[c]?.includes('object') || selectedDs.dtypes?.[c]?.includes('str')) || [];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Datasets available', value: datasets.length, icon: Table },
          { label: 'Numeric columns', value: numericCols.length, icon: Sigma },
          { label: 'Text columns', value: textCols.length, icon: Layers },
          { label: 'Suggested transforms', value: suggestions.length, icon: Wand2 },
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

      <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Feature intelligence</p>
            <h2 className="text-2xl font-semibold text-white">Craft high-signal features with AI assistance</h2>
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <select className="flex-1 rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none" value={selected} onChange={e => setSelected(e.target.value)}>
            <option value="">Select a dataset...</option>
            {datasets.map((d: any) => <option key={d.name} value={d.name}>{d.name} ({d.rows} rows)</option>)}
          </select>
        </div>

        {selectedDs && (
          <div className="flex flex-wrap gap-4 mb-6 p-4 rounded-2xl border border-white/10 bg-white/[0.03]">
            <div className="flex-1 min-w-[200px]">
              <p className="text-[11px] text-slate-500 mb-1">NUMERIC COLUMNS</p>
              <div className="flex flex-wrap gap-1">
                {numericCols.length === 0 && <span className="text-xs text-slate-600">None</span>}
                {numericCols.slice(0, 8).map((c: string) => (
                  <span key={c} className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">{c}</span>
                ))}
                {numericCols.length > 8 && <span className="text-[11px] text-slate-600">+{numericCols.length - 8}</span>}
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <p className="text-[11px] text-slate-500 mb-1">TEXT / CATEGORY COLUMNS</p>
              <div className="flex flex-wrap gap-1">
                {textCols.length === 0 && <span className="text-xs text-slate-600">None</span>}
                {textCols.slice(0, 8).map((c: string) => (
                  <span key={c} className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">{c}</span>
                ))}
                {textCols.length > 8 && <span className="text-[11px] text-slate-600">+{textCols.length - 8}</span>}
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-200">
              <Wand2 className="h-4 w-4 text-primary" />
              Suggested transforms
              {suggestions.length > 0 && <span className="ml-auto text-[11px] text-slate-500">{suggestions.length} available</span>}
            </div>
            <div className="space-y-2">
              {suggestions.length === 0 && (
                <p className="text-sm text-slate-500 py-4 text-center">{selected ? 'No suggestions for this dataset' : 'Select a dataset to see suggestions'}</p>
              )}
              {suggestions.map((s: any, i: number) => {
                const meta = TRANSFORM_META[s.type] || { icon: Sparkles, color: 'text-zinc-400' };
                const Icon = meta.icon;
                return (
                  <div key={i} className="rounded-2xl border border-white/10 bg-[#111827]/70 px-4 py-3 transition hover:bg-white/[0.04]">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-3.5 w-3.5 ${meta.color}`} />
                        <span className="text-[11px] font-medium text-slate-500 uppercase">{s.type}</span>
                      </div>
                      <button
                        className="rounded-xl bg-primary/20 px-3 py-1 text-xs text-white hover:bg-primary/30 transition-colors disabled:opacity-50"
                        onClick={() => handleGenerate([s])}
                        disabled={running}
                      >
                        Add
                      </button>
                    </div>
                    <p className="text-[13px] text-slate-300">{s.description}</p>
                    {s.columns && s.columns.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {s.columns.map((c: string) => (
                          <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500">{c}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-accent/10 to-primary/10 p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-200">
              <Bot className="h-4 w-4 text-accent" />
              {result ? 'Generated features' : 'Copilot recommendation'}
            </div>
            {result ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">{result.new_columns} new features created</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.generated_features.map((f: string) => (
                    <span key={f} className="rounded-xl bg-white/10 px-3 py-1 text-xs text-slate-300 font-mono">{f}</span>
                  ))}
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span>Saved as</span>
                  <span className="text-primary font-mono">{result.enhanced_file}</span>
                </div>
                <button
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                  onClick={() => setResult(null)}
                >
                  Generate more
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {selected
                    ? `Found ${suggestions.length} feature transforms for this dataset. Add individual transforms or generate all at once.`
                    : 'Select a dataset to view AI-suggested feature engineering transforms.'}
                </p>
                <div className="mt-4 space-y-2">
                  {[
                    { icon: Sigma, label: 'Polynomial features', desc: 'Squares, cubes, interactions' },
                    { icon: Workflow, label: 'Pairwise interactions', desc: 'Multiplication between features' },
                    { icon: FunctionSquare, label: 'Log transforms', desc: 'Handle skewed distributions' },
                    { icon: Layers, label: 'Binned encodings', desc: 'Discretize continuous values' },
                  ].map((t) => {
                    const TIcon = t.icon;
                    return (
                      <div key={t.label} className="flex items-center gap-2.5 text-xs text-slate-400">
                        <TIcon className="h-3.5 w-3.5 text-accent" />
                        <span className="text-slate-300">{t.label}</span>
                        <span className="text-slate-600">— {t.desc}</span>
                      </div>
                    );
                  })}
                </div>
                <button
                  className="mt-4 w-full rounded-2xl bg-primary/30 px-4 py-3 text-sm font-medium text-white hover:bg-primary/40 transition-colors disabled:opacity-40"
                  onClick={() => handleGenerate(suggestions)}
                  disabled={!selected || running || suggestions.length === 0}
                >
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
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Total columns</p>
              <p className="mt-1 text-2xl font-semibold text-white">{result.total_columns}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">New features</p>
              <p className="mt-1 text-2xl font-semibold text-white">{result.new_columns}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 col-span-2">
              <p className="text-sm text-slate-400">Enhanced file</p>
              <p className="mt-1 text-sm font-mono text-primary truncate">{result.enhanced_file}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {result.generated_features.map((f: string) => (
              <div key={f} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 flex items-center gap-2">
                <ArrowRight className="h-3 w-3 text-accent" />
                <span className="text-sm text-white font-mono">{f}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}

export default EngineeringPage;
