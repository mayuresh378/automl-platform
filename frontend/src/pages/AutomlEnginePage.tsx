import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu, Play, FlaskConical, Trophy, BarChart3, BrainCircuit, Rocket,
  CheckCircle2, Clock, ChevronRight, ChevronLeft, RotateCcw, Gauge,
  TrendingUp, ArrowUpDown, DatabaseZap, Sparkles, Download, GitCompare,
  Network, Target, Layers, Activity, Zap,
} from 'lucide-react';
import { api, downloadBlob } from '../lib/api';
import { useNotificationStore } from '../store/useNotificationStore';
import { staggerContainer, staggerItem } from '../lib/animations';

const STEPS = [
  { key: 'configure', label: 'Configure', icon: DatabaseZap },
  { key: 'train', label: 'Train', icon: Cpu },
  { key: 'compare', label: 'Compare', icon: GitCompare },
  { key: 'results', label: 'Results', icon: Trophy },
];

const MODEL_META: Record<string, { color: string; icon: any }> = {
  RandomForest: { color: '#22C55E', icon: Network },
  DecisionTree: { color: '#F59E0B', icon: Layers },
  GradientBoosting: { color: '#6366F1', icon: TrendingUp },
  LogisticRegression: { color: '#06B6D4', icon: Activity },
  SVC: { color: '#EF4444', icon: Target },
  KNN: { color: '#EC4899', icon: BrainCircuit },
  NaiveBayes: { color: '#8B5CF6', icon: FlaskConical },
  XGBoost: { color: '#10B981', icon: Zap },
  LightGBM: { color: '#F97316', icon: Gauge },
  CatBoost: { color: '#3B82F6', icon: BarChart3 },
  Ridge: { color: '#14B8A6', icon: TrendingUp },
  Lasso: { color: '#F43F5E', icon: TrendingUp },
  SVR: { color: '#EF4444', icon: Target },
};

const ALGORITHM_GROUPS = [
  { label: 'Ensemble', models: ['RandomForest', 'GradientBoosting', 'XGBoost', 'LightGBM', 'CatBoost'] },
  { label: 'Linear & Probabilistic', models: ['LogisticRegression', 'Ridge', 'Lasso', 'NaiveBayes'] },
  { label: 'Tree & Instance', models: ['DecisionTree', 'KNN', 'SVC', 'SVR'] },
];

export default function AutomlEnginePage() {
  const [step, setStep] = useState(0);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [targetColumn, setTargetColumn] = useState('');
  const [taskType, setTaskType] = useState<'auto' | 'classification' | 'regression'>('auto');
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set(['RandomForest', 'GradientBoosting', 'LogisticRegression', 'DecisionTree', 'KNN']));
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [optionalAvailable, setOptionalAvailable] = useState<Record<string, boolean>>({});
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [bestModel, setBestModel] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const notify = useNotificationStore((s) => s.add);

  useEffect(() => {
    api.datasets.list().then(r => setDatasets(r.datasets)).catch(() => {});
    api.get('/api/v1/engine/models').then((r: any) => {
      setAvailableModels(r.all || []);
      setOptionalAvailable(r.optional || {});
    }).catch(() => {});
  }, []);

  const cols = datasets.find(d => d.name === selectedDataset)?.columns || [];

  const toggleModel = (name: string) => {
    setSelectedModels(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedModels(new Set(availableModels));
  };

  const selectNone = () => {
    setSelectedModels(new Set());
  };

  const runTraining = async () => {
    if (!selectedDataset || !targetColumn || selectedModels.size === 0) return;
    setRunning(true);
    setProgress(0);
    setResults(null);
    setBestModel(null);
    const interval = setInterval(() => setProgress(p => Math.min(p + 5, 90)), 800);
    try {
      const res: any = await api.post('/api/v1/engine/train', {
        file_name: selectedDataset,
        target_column: targetColumn,
        models: JSON.stringify([...selectedModels]),
        task_type: taskType === 'auto' ? '' : taskType,
      });
      setResults(res.results || []);
      setBestModel(res.best_model);
      setElapsed(res.elapsed || 0);
      setProgress(100);
      notify({ title: 'Engine complete', message: `Best: ${res.best_model} — ${res.results?.length || 0} models trained`, type: 'success' });
    } catch (err: any) {
      notify({ title: 'Training failed', message: err.message, type: 'error' });
    }
    clearInterval(interval);
    setRunning(false);
  };

  const exportResults = () => {
    if (!results) return;
    const data = results.filter(r => !r.error).map((r: any) => ({
      model: r.name,
      cv_score: r.cv_score,
      accuracy: r.metrics?.accuracy,
      precision: r.metrics?.precision,
      recall: r.metrics?.recall,
      f1: r.metrics?.f1,
      r2: r.metrics?.r2,
      mse: r.metrics?.mse,
      rmse: r.metrics?.rmse,
      training_time_s: r.training_time,
    }));
    downloadBlob(data, `automl-results-${selectedDataset}.csv`);
  };

  const predictedTask = useMemo(() => {
    if (taskType !== 'auto') return taskType;
    if (cols.length > 0 && targetColumn) {
      const sample = datasets.find(d => d.name === selectedDataset);
      const dtype = sample?.dtypes?.[targetColumn];
      if (dtype === 'object' || dtype === 'bool') return 'classification';
      return 'regression';
    }
    return null;
  }, [taskType, cols, targetColumn, datasets, selectedDataset]);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">One-click AutoML</p>
          <h2 className="text-2xl font-semibold text-white">AutoML Engine</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
            <Gauge className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs text-slate-400">{selectedModels.size} models selected</span>
          </div>
        </div>
      </div>

      {/* Steps bar */}
      <div className="flex items-center gap-0 rounded-[32px] border border-white/10 bg-[#111827]/80 p-1.5">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = i === step;
          const done = i < step;
          return (
            <button
              key={s.key}
              onClick={() => { if (i <= step) setStep(i); }}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all flex-1 justify-center ${
                active ? 'bg-primary/15 text-primary border border-primary/30' :
                done ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              <Icon className={`h-4 w-4 ${done ? 'text-emerald-400' : ''}`} />
              {s.label}
              {done && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0: Configure */}
        {step === 0 && (
          <motion.div key="configure" variants={staggerItem} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
              <h3 className="text-lg font-semibold text-white mb-5">Dataset & Target</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 block mb-1">Dataset</label>
                  <select className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none" value={selectedDataset} onChange={e => { setSelectedDataset(e.target.value); setTargetColumn(''); }}>
                    <option value="">Choose a dataset...</option>
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
                <div>
                  <label className="text-sm text-slate-400 block mb-1">Task type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['auto', 'classification', 'regression'] as const).map(t => (
                      <button key={t} onClick={() => setTaskType(t)} className={`rounded-2xl border px-4 py-2.5 text-sm capitalize transition-all ${taskType === t ? 'border-primary/50 bg-primary/10 text-white' : 'border-white/10 text-slate-400 hover:text-white'}`}>
                        {t === 'auto' ? 'Auto-detect' : t}
                      </button>
                    ))}
                  </div>
                  {predictedTask && taskType === 'auto' && (
                    <p className="text-xs text-primary mt-2">Auto-detected: {predictedTask}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Algorithms</h3>
                <div className="flex gap-2">
                  <button onClick={selectAll} className="text-xs text-primary hover:text-primary/80">Select all</button>
                  <button onClick={selectNone} className="text-xs text-slate-500 hover:text-slate-300">Clear</button>
                </div>
              </div>
              <div className="space-y-4 max-h-[360px] overflow-y-auto">
                {ALGORITHM_GROUPS.map(g => (
                  <div key={g.label}>
                    <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">{g.label}</p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {g.models.filter(m => availableModels.includes(m)).map(m => {
                        const meta = MODEL_META[m] || { color: '#6366F1', icon: BrainCircuit };
                        const Icon = meta.icon;
                        const isOptional = ['XGBoost', 'LightGBM', 'CatBoost'].includes(m);
                        const installed = isOptional ? optionalAvailable[m] : true;
                        return (
                          <button
                            key={m}
                            onClick={() => installed && toggleModel(m)}
                            disabled={!installed}
                            className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-all ${
                              selectedModels.has(m)
                                ? 'border-white/20 bg-white/10 text-white'
                                : 'border-white/5 text-slate-500 hover:text-slate-300'
                            } ${!installed ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: meta.color }} />
                            <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: meta.color }} />
                            <span className="flex-1 text-left">{m}</span>
                            {!installed && <span className="text-[10px] text-slate-600">not installed</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 1: Train */}
        {step === 1 && (
          <motion.div key="train" variants={staggerItem} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6 text-center">
            {!running && !results ? (
              <div className="py-12 space-y-6">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Cpu className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Ready to train</h3>
                  <p className="text-sm text-slate-400 max-w-md mx-auto">
                    {selectedDataset && targetColumn
                      ? `${selectedModels.size} algorithms will be trained on "${selectedDataset}" targeting "${targetColumn}"`
                      : 'Configure dataset and target on the previous step'}
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {[...selectedModels].map(m => (
                    <span key={m} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">{m}</span>
                  ))}
                </div>
                <button
                  onClick={runTraining}
                  disabled={!selectedDataset || !targetColumn}
                  className="mx-auto flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-accent px-8 py-3.5 font-semibold text-white disabled:opacity-40"
                >
                  <Play className="h-5 w-5" />
                  Start AutoML Training
                </button>
                <button onClick={() => setStep(0)} className="text-sm text-slate-500 hover:text-slate-300">← Back to configuration</button>
              </div>
            ) : running ? (
              <div className="py-12 space-y-6">
                <RotateCcw className="h-10 w-10 mx-auto text-primary animate-spin" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Training in progress...</h3>
                  <p className="text-sm text-slate-400">Running {selectedModels.size} algorithms</p>
                </div>
                <div className="mx-auto max-w-md">
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                      initial={{ width: '0%' }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{progress}%</p>
                </div>
              </div>
            ) : null}
          </motion.div>
        )}

        {/* Step 2: Compare */}
        {step === 2 && results && results.length > 0 && (
          <motion.div key="compare" variants={staggerItem} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-white">Model Comparison</h3>
                <div className="flex gap-2">
                  <button onClick={exportResults} className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs text-slate-400 hover:text-white">
                    <Download className="h-3.5 w-3.5" /> Export CSV
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {results.filter(r => !r.error).sort((a: any, b: any) => (b.cv_score || 0) - (a.cv_score || 0)).map((r: any, idx: number) => {
                  const meta = MODEL_META[r.name] || { color: '#6366F1', icon: BrainCircuit };
                  const Icon = meta.icon;
                  const isBest = r.name === bestModel;
                  const score = r.cv_score || 0;
                  return (
                    <motion.div
                      key={r.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`rounded-2xl border p-4 transition-all cursor-pointer ${isBest ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 bg-white/5'} ${expandedResult === r.name ? 'ring-1 ring-primary/30' : ''}`}
                      onClick={() => setExpandedResult(expandedResult === r.name ? null : r.name)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center justify-center h-9 w-9 rounded-xl shrink-0 ${isBest ? 'bg-emerald-500/20' : 'bg-white/10'}`}>
                          {isBest ? <Trophy className="h-5 w-5 text-emerald-400" /> : <Icon className="h-4 w-4" style={{ color: meta.color }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{r.name}</span>
                            {isBest && <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300 font-medium">BEST</span>}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-slate-400">CV: <strong className="text-white">{score}</strong></span>
                            <span className="text-xs text-slate-400">Time: {r.training_time}s</span>
                          </div>
                        </div>
                        <div className="w-24">
                          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: isBest ? '#22C55E' : meta.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(score * 100, 100)}%` }}
                              transition={{ duration: 0.8, delay: idx * 0.05 }}
                            />
                          </div>
                        </div>
                      </div>
                      {expandedResult === r.name && r.metrics && (
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/5">
                          {Object.entries(r.metrics).filter(([k]) => !['confusion_matrix'].includes(k)).map(([k, v]: any) => (
                            <div key={k} className="rounded-xl bg-white/5 px-3 py-2">
                              <p className="text-[10px] text-slate-500 uppercase">{k}</p>
                              <p className="text-sm font-medium text-white">{typeof v === 'number' ? v.toFixed(4) : String(v).slice(0, 30)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Visual Comparison</h3>
              <div className="space-y-3">
                {results.filter(r => !r.error).sort((a: any, b: any) => (b.cv_score || 0) - (a.cv_score || 0)).map((r: any, idx: number) => {
                  const score = r.cv_score || 0;
                  const meta = MODEL_META[r.name] || { color: '#6366F1' };
                  const isBest = r.name === bestModel;
                  return (
                    <div key={r.name} className="flex items-center gap-3">
                      <span className="w-28 text-xs text-slate-400 truncate shrink-0 text-right">{r.name}</span>
                      <div className="flex-1 h-5 rounded-lg bg-white/5 overflow-hidden relative">
                        <motion.div
                          className="h-full rounded-lg flex items-center justify-end px-2"
                          style={{ backgroundColor: meta.color + '40', width: `${Math.max(score * 100, 2)}%` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(score * 100, 2)}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.05 }}
                        />
                      </div>
                      <span className={`w-16 text-xs font-mono text-right ${isBest ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}>{score.toFixed(4)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Results */}
        {step === 3 && bestModel && results && (
          <motion.div key="results" variants={staggerItem} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            {/* Best model hero */}
            <div className="card-hover rounded-[32px] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-primary/5 p-8 text-center">
              <Trophy className="h-12 w-12 mx-auto text-emerald-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Best Model: {bestModel}</h3>
              <p className="text-slate-400 text-sm mb-6">Completed in {elapsed}s across {results.filter(r => !r.error).length} models</p>
              <div className="flex flex-wrap justify-center gap-4">
                <button onClick={() => setStep(1)} className="flex items-center gap-2 rounded-2xl border border-white/10 px-5 py-2.5 text-sm text-white hover:bg-white/5">
                  <RotateCcw className="h-4 w-4" /> Retrain
                </button>
                <button onClick={exportResults} className="flex items-center gap-2 rounded-2xl border border-white/10 px-5 py-2.5 text-sm text-white hover:bg-white/5">
                  <Download className="h-4 w-4" /> Export Results
                </button>
              </div>
            </div>

            {/* Ranked table */}
            <div className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Full Rankings</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-slate-500">
                      <th className="pb-3 pr-4">#</th>
                      <th className="pb-3 pr-4">Model</th>
                      <th className="pb-3 pr-4">CV Score</th>
                      <th className="pb-3 pr-4">Time (s)</th>
                      <th className="pb-3 pr-4">Accuracy / R²</th>
                      <th className="pb-3 pr-4">F1 / RMSE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.filter(r => !r.error).sort((a: any, b: any) => (b.cv_score || 0) - (a.cv_score || 0)).map((r: any, idx: number) => {
                      const isBest = r.name === bestModel;
                      const primaryMetric = r.metrics?.accuracy ?? r.metrics?.r2 ?? '-';
                      const secondaryMetric = r.metrics?.f1 ?? r.metrics?.rmse ?? '-';
                      return (
                        <tr key={r.name} className={`border-b border-white/5 ${isBest ? 'bg-emerald-500/5' : ''}`}>
                          <td className="py-3 pr-4">
                            {idx === 0 ? <Trophy className="h-4 w-4 text-emerald-400" /> : idx === 1 ? <span className="text-slate-400">🥈</span> : idx === 2 ? <span className="text-slate-400">🥉</span> : <span className="text-slate-600">{idx + 1}</span>}
                          </td>
                          <td className={`py-3 pr-4 font-medium ${isBest ? 'text-emerald-300' : 'text-white'}`}>{r.name}</td>
                          <td className={`py-3 pr-4 font-mono ${isBest ? 'text-emerald-400' : 'text-slate-300'}`}>{r.cv_score?.toFixed(4)}</td>
                          <td className="py-3 pr-4 text-slate-400 font-mono">{r.training_time?.toFixed(1)}</td>
                          <td className="py-3 pr-4 text-slate-300 font-mono">{typeof primaryMetric === 'number' ? primaryMetric.toFixed(4) : primaryMetric}</td>
                          <td className="py-3 pr-4 text-slate-300 font-mono">{typeof secondaryMetric === 'number' ? secondaryMetric.toFixed(4) : secondaryMetric}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Errors */}
            {results.some(r => r.error) && (
              <div className="card-hover rounded-[32px] border border-red-500/10 bg-red-500/5 p-6">
                <h3 className="text-sm font-medium text-red-400 mb-3">Failed models</h3>
                <div className="space-y-2">
                  {results.filter(r => r.error).map(r => (
                    <div key={r.name} className="text-xs text-red-300/70">
                      <strong>{r.name}:</strong> {r.error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-400 disabled:opacity-30 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>
        {step < 3 && (
          <button
            onClick={() => {
              if (step === 1 && !running && !results) return;
              if (step === 1 && !results) return;
              setStep(s => Math.min(3, s + 1));
            }}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-30"
            disabled={(step === 0 && (!selectedDataset || !targetColumn || selectedModels.size === 0)) || (step === 1 && (running || !results))}
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
