import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Search, FlaskConical, Plus, Trash2, Play, RotateCcw } from 'lucide-react';
import { api } from '../lib/api';
import { useNotificationStore } from '../store/useNotificationStore';
import { staggerContainer, staggerItem } from '../lib/animations';

type ParamConfig = { values: number[] | string[] } | { min: number; max: number; step?: number };

interface ModelParam {
  params: Record<string, any[]>;
  formats: Record<string, { type: string; range?: number[]; values?: string[]; log?: boolean }>;
}

export default function HyperparameterPage() {
  const [models, setModels] = useState<Record<string, Record<string, ModelParam>>>({});
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [targetColumn, setTargetColumn] = useState('');
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [paramOverrides, setParamOverrides] = useState<Record<string, Record<string, string>>>({});
  const [searchMethod, setSearchMethod] = useState<'random' | 'grid'>('random');
  const [cvFolds, setCvFolds] = useState(5);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'results'>('config');
  const notify = useNotificationStore((s) => s.add);

  useEffect(() => {
    api.get('/api/v1/tuning/params').then((r: any) => setModels(r)).catch(() => {});
    api.datasets.list().then(r => setDatasets(r.datasets)).catch(() => {});
  }, []);

  const toggleModel = (name: string) => {
    setSelectedModels(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const updateParam = (model: string, key: string, value: string) => {
    setParamOverrides(prev => ({
      ...prev,
      [model]: { ...(prev[model] || {}), [key]: value },
    }));
  };

  const addCustomParam = (model: string) => {
    setParamOverrides(prev => ({
      ...prev,
      [model]: { ...(prev[model] || {}), __new__: '' },
    }));
  };

  const runTuning = async () => {
    if (!selectedDataset || !targetColumn || selectedModels.size === 0) return;
    setRunning(true);
    setResults(null);
    setActiveTab('results');
    try {
      const params: Record<string, Record<string, any[]>> = {};
      for (const [model, overrides] of Object.entries(paramOverrides)) {
        if (!selectedModels.has(model)) continue;
        const parsed: Record<string, any[]> = {};
        for (const [k, v] of Object.entries(overrides)) {
          if (k === '__new__' || !v) continue;
          parsed[k] = v.split(',').map(s => {
            const n = Number(s.trim());
            return isNaN(n) ? s.trim() : n;
          });
        }
        if (Object.keys(parsed).length > 0) params[model] = parsed;
      }
      const res: any = await api.post('/api/v1/tuning', {
        file_name: selectedDataset,
        target_column: targetColumn,
        models: JSON.stringify([...selectedModels]),
        params: JSON.stringify(params),
        search_method: searchMethod,
        cv_folds: cvFolds,
      });
      setResults(res.results || []);
      notify({ title: 'Tuning complete', message: `${res.results?.length || 0} models trained`, type: 'success' });
    } catch (err: any) {
      notify({ title: 'Tuning failed', message: err.message, type: 'error' });
    }
    setRunning(false);
  };

  const cols = datasets.find(d => d.name === selectedDataset)?.columns || [];
  const allModels = { ...(models.classification || {}), ...(models.regression || {}) };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">Model Tuning</p>
          <h2 className="text-2xl font-semibold text-white">Hyperparameter Optimization</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setActiveTab('config'); setResults(null); }} className={`rounded-xl px-4 py-2 text-sm ${activeTab === 'config' ? 'bg-primary/20 text-primary' : 'text-slate-400 hover:text-white'}`}>Config</button>
          <button onClick={() => setActiveTab('results')} className={`rounded-xl px-4 py-2 text-sm ${activeTab === 'results' ? 'bg-primary/20 text-primary' : 'text-slate-400 hover:text-white'}`}>Results</button>
        </div>
      </div>

      {activeTab === 'config' && (
        <motion.div variants={staggerItem} className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <div className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
            <div className="mb-5 flex items-center gap-3">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-white">Configuration</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 block mb-1">Dataset</label>
                <select className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none" value={selectedDataset} onChange={e => { setSelectedDataset(e.target.value); setTargetColumn(''); }}>
                  <option value="">Select a dataset...</option>
                  {datasets.map((d: any) => <option key={d.name} value={d.name}>{d.filename || d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Target column</label>
                <select className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none" value={targetColumn} onChange={e => setTargetColumn(e.target.value)}>
                  <option value="">Select target...</option>
                  {cols.map((c: string) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 block mb-1">Search method</label>
                  <select className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none" value={searchMethod} onChange={e => setSearchMethod(e.target.value as any)}>
                    <option value="random">Random Search</option>
                    <option value="grid">Grid Search</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-400 block mb-1">CV folds</label>
                  <input type="number" min={2} max={10} className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none" value={cvFolds} onChange={e => setCvFolds(Number(e.target.value))} />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-3">Models to tune</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(allModels).map(([name]) => (
                    <button key={name} onClick={() => toggleModel(name)} className={`rounded-2xl border px-4 py-2.5 text-sm text-left transition-all ${selectedModels.has(name) ? 'border-primary/50 bg-primary/10 text-white' : 'border-white/10 text-slate-400 hover:text-white'}`}>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${selectedModels.has(name) ? 'bg-primary' : 'bg-slate-600'}`} />
                        {name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={runTuning} disabled={running || selectedModels.size === 0 || !selectedDataset} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-6 py-3 font-semibold text-white disabled:opacity-50">
                {running ? <RotateCcw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                {running ? 'Tuning...' : `Run ${searchMethod === 'grid' ? 'Grid' : 'Random'} Search (${selectedModels.size} models)`}
              </button>
            </div>
          </div>

          <div className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Parameter Overrides</h3>
              <p className="text-xs text-slate-500">Leave empty to use defaults</p>
            </div>
            {selectedModels.size === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Select models to customize parameters</p>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {[...selectedModels].map(model => {
                  const spec = allModels[model];
                  if (!spec) return null;
                  return (
                    <div key={model} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm font-medium text-white mb-3">{model}</p>
                      {Object.entries(spec.params).map(([key, values]) => (
                        <div key={key} className="mb-2">
                          <label className="text-xs text-slate-400 block mb-0.5">{key} <span className="text-slate-600">(default: {values.join(', ')})</span></label>
                          <input
                            placeholder="e.g. 10, 50, 100"
                            className="w-full rounded-xl border border-white/10 bg-[#111827] px-3 py-2 text-sm text-white outline-none"
                            value={(paramOverrides[model] || {})[key] || ''}
                            onChange={e => updateParam(model, key, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === 'results' && (
        <motion.div variants={staggerItem} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center gap-3">
            <FlaskConical className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold text-white">Tuning Results</h3>
          </div>
          {!results ? (
            <p className="text-sm text-slate-500 text-center py-12">
              {running ? 'Training models...' : 'Run a tuning job to see results'}
            </p>
          ) : results.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-12">No results</p>
          ) : (
            <div className="space-y-3">
              {results.map((r: any) => (
                <div key={r.name} className={`rounded-2xl border p-4 ${r.error ? 'border-red-500/20 bg-red-500/5' : 'border-white/10 bg-white/5'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white">{r.name}</span>
                    {r.error ? (
                      <span className="text-xs text-red-400">{r.error}</span>
                    ) : (
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">CV: {r.cv_score}</span>
                    )}
                  </div>
                  {!r.error && (
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                      <div>Training time: {r.training_time}s</div>
                      <div>Best params: {JSON.stringify(r.best_params)}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
