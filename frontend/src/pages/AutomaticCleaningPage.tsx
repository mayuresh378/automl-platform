import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Database, Play, CheckCircle2, Clock, RotateCcw, Download,
  AlertTriangle, BarChart3, Columns, Scan, GitCompare, ArrowRight,
  Gauge, Layers, Network, Filter, TrendingUp, Activity, Cpu, Zap,
  XCircle, Loader2,
} from 'lucide-react';
import { api, downloadUrl } from '../lib/api';
import { useNotificationStore } from '../store/useNotificationStore';
import { staggerContainer, staggerItem } from '../lib/animations';

interface PipelineStep {
  key: string;
  label: string;
  icon: any;
  color: string;
  description: string;
}

const PIPELINE_STEPS: PipelineStep[] = [
  { key: 'missing', label: 'Missing Values', icon: AlertTriangle, color: '#F59E0B', description: 'Impute nulls with median/mode' },
  { key: 'duplicates', label: 'Duplicate Removal', icon: GitCompare, color: '#6366F1', description: 'Remove duplicate rows' },
  { key: 'encoding', label: 'Encoding', icon: Layers, color: '#06B6D4', description: 'One-hot encode categoricals' },
  { key: 'outliers', label: 'Outlier Detection', icon: Scan, color: '#EF4444', description: 'IQR-based outlier removal' },
  { key: 'scaling', label: 'Scaling', icon: TrendingUp, color: '#22C55E', description: 'Standardize numeric features' },
  { key: 'normalization', label: 'Normalization', icon: Activity, color: '#8B5CF6', description: 'MinMax normalize to [0,1]' },
  { key: 'standardization', label: 'Standardization', icon: BarChart3, color: '#EC4899', description: 'Z-score standardization' },
  { key: 'features', label: 'Feature Selection', icon: Filter, color: '#F97316', description: 'Drop low-variance features' },
];

export default function AutomaticCleaningPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selected, setSelected] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showPipeline, setShowPipeline] = useState(false);
  const notify = useNotificationStore((s) => s.add);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    api.datasets.list().then(r => setDatasets(r.datasets)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selected) { setProfile(null); setResult(null); setCompletedSteps(new Set()); return; }
    api.datasets.profile(selected).then(setProfile).catch(() => setProfile(null));
  }, [selected]);

  const runAutoClean = async () => {
    if (!selected) return;
    setRunning(true);
    setResult(null);
    setCompletedSteps(new Set());
    setShowPipeline(true);
    setCurrentStep(0);

    const stepKeys = PIPELINE_STEPS.map(s => s.key);
    for (let i = 0; i < stepKeys.length; i++) {
      await new Promise(r => setTimeout(r, 400));
      setCurrentStep(i);
      setCompletedSteps(prev => new Set([...prev, stepKeys[i]]));
    }

    try {
      const res: any = await api.post(`/api/v1/datasets/${encodeURIComponent(selected)}/auto-clean`, {});
      setResult(res);
      notify({ title: 'Auto-cleaning complete', message: `${res.applied_operations?.length || 0} operations applied`, type: 'success' });
    } catch (err: any) {
      notify({ title: 'Auto-cleaning failed', message: err.message, type: 'error' });
    }
    setRunning(false);
    setCurrentStep(-1);
  };

  const hasMissing = profile?.column_details?.filter((c: any) => c.missing > 0).length > 0;
  const hasOutliers = profile?.column_details?.reduce((s: number, c: any) => s + (c.outliers || 0), 0) > 0;
  const hasDuplicates = profile?.duplicates > 0;
  const hasCategorical = profile?.column_details?.filter((c: any) => c.dtype === 'object').length > 0;
  const hasNumeric = profile?.column_details?.filter((c: any) => c.dtype in ['int64', 'float64']).length > 0;

  const pipelineSteps = [
    { ...PIPELINE_STEPS[0], active: hasMissing, detail: hasMissing ? `${profile?.column_details?.filter((c: any) => c.missing > 0).length} columns with nulls` : 'No missing values' },
    { ...PIPELINE_STEPS[1], active: hasDuplicates, detail: hasDuplicates ? `${profile?.duplicates} duplicate rows` : 'No duplicates' },
    { ...PIPELINE_STEPS[2], active: hasCategorical, detail: hasCategorical ? `${profile?.column_details?.filter((c: any) => c.dtype === 'object').length} categorical columns` : 'No categorical data' },
    { ...PIPELINE_STEPS[3], active: hasOutliers, detail: hasOutliers ? `${profile?.column_details?.reduce((s: number, c: any) => s + (c.outliers || 0), 0)} outlier rows` : 'No outliers detected' },
    { ...PIPELINE_STEPS[4], active: hasNumeric, detail: hasNumeric ? `${profile?.column_details?.filter((c: any) => c.dtype in ['int64', 'float64']).length} numeric columns` : 'No numeric data' },
    { ...PIPELINE_STEPS[5], active: hasNumeric, detail: 'MinMax scale to [0,1]' },
    { ...PIPELINE_STEPS[6], active: hasNumeric, detail: 'Z-score standardization' },
    { ...PIPELINE_STEPS[7], active: hasNumeric, detail: 'Remove low-variance features' },
  ];

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">Automatic Data Cleaning</p>
          <h2 className="text-2xl font-semibold text-white">One-click dataset pipeline</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
            <Cpu className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs text-slate-400">{PIPELINE_STEPS.length} steps</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Left Column - Dataset + Controls */}
        <div className="space-y-6">
          {/* Dataset selector + profile */}
          <div className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
            <div className="mb-5">
              <label className="text-sm text-slate-400 block mb-2">Dataset</label>
              <select className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none" value={selected} onChange={e => setSelected(e.target.value)}>
                <option value="">Select a dataset...</option>
                {datasets.map((d: any) => <option key={d.name} value={d.name}>{d.filename || d.name}</option>)}
              </select>
            </div>

            {profile && (
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Rows', value: profile.rows, icon: Database, color: 'text-primary' },
                  { label: 'Columns', value: profile.columns, icon: Columns, color: 'text-accent' },
                  { label: 'Missing', value: `${profile.missing_pct}%`, icon: AlertTriangle, color: hasMissing ? 'text-amber-400' : 'text-emerald-400' },
                  { label: 'Duplicates', value: profile.duplicates, icon: GitCompare, color: hasDuplicates ? 'text-amber-400' : 'text-emerald-400' },
                ].map(stat => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1">
                        <Icon className={`h-3 w-3 ${stat.color}`} />
                        {stat.label}
                      </div>
                      <p className="text-lg font-semibold text-white">{stat.value}</p>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={runAutoClean}
              disabled={!selected || running}
              className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-accent px-6 py-3.5 font-semibold text-white disabled:opacity-40"
            >
              {running ? (
                <RotateCcw className="h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
              {running ? 'Cleaning...' : 'Run Automatic Cleaning'}
            </button>
          </div>

          {/* Pipeline Visualization */}
          {showPipeline && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <Layers className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-white">Pipeline</h3>
              </div>
              <div className="space-y-1">
                {pipelineSteps.map((step, i) => {
                  const isRunning = currentStep === i;
                  const isDone = running ? completedSteps.has(step.key) : (result?.applied_operations?.some((op: string) => op.toLowerCase().includes(step.key.replace(/_/g, ' '))) ?? false);
                  const willRun = step.active;

                  return (
                    <div key={step.key} className="relative flex items-start gap-3">
                      {/* Connector line */}
                      {i < pipelineSteps.length - 1 && (
                        <div className={`absolute left-3.5 top-9 w-0.5 h-8 ${isDone ? 'bg-emerald-500/50' : 'bg-white/5'}`} />
                      )}

                      {/* Step icon */}
                      <div className={`relative z-10 flex items-center justify-center h-7 w-7 rounded-full shrink-0 border ${
                        isRunning ? 'border-primary bg-primary/20 animate-pulse' :
                        isDone ? 'border-emerald-500 bg-emerald-500/20' :
                        'border-white/10 bg-white/5'
                      }`}>
                        {isRunning ? (
                          <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                        ) : isDone ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <div className={`h-2 w-2 rounded-full ${willRun ? 'bg-primary/50' : 'bg-white/10'}`} />
                        )}
                      </div>

                      {/* Step content */}
                      <div className={`flex-1 pb-3 ${!willRun ? 'opacity-30' : ''}`}>
                        <div className="flex items-center gap-2">
                          <step.icon className={`h-3.5 w-3.5 ${isDone ? 'text-emerald-400' : isRunning ? 'text-primary' : 'text-slate-500'}`} />
                          <span className={`text-sm font-medium ${isDone ? 'text-emerald-300' : isRunning ? 'text-primary' : 'text-slate-400'}`}>
                            {step.label}
                          </span>
                          {isDone && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                          {isRunning && <span className="text-[10px] text-primary animate-pulse">processing...</span>}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 ml-5">{step.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {/* Pre-cleaning issues */}
          {profile && !result && !running && (
            <div className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Scan className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-semibold text-white">Detected Issues</h3>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Missing values', active: hasMissing, detail: `${profile.missing_pct}% of data` },
                  { label: 'Duplicate rows', active: hasDuplicates, detail: `${profile.duplicates} rows` },
                  { label: 'Outliers', active: hasOutliers, detail: `${profile.column_details?.reduce((s: number, c: any) => s + (c.outliers || 0), 0)} cells` },
                  { label: 'Categorical unencoded', active: hasCategorical, detail: `${profile.column_details?.filter((c: any) => c.dtype === 'object').length} columns` },
                  { label: 'Unscaled numerics', active: hasNumeric, detail: `${profile.column_details?.filter((c: any) => c.dtype in ['int64', 'float64']).length} features` },
                ].map(issue => (
                  <div key={issue.label} className={`flex items-center justify-between rounded-xl border px-3 py-2 ${
                    issue.active ? 'border-amber-500/20 bg-amber-500/5' : 'border-white/5 opacity-40'
                  }`}>
                    <div className="flex items-center gap-2">
                      {issue.active ? <AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                      <span className="text-xs text-slate-300">{issue.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{issue.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Running state */}
          {running && (
            <div className="card-hover rounded-[32px] border border-primary/20 bg-primary/5 p-6 text-center">
              <RotateCcw className="h-8 w-8 mx-auto text-primary animate-spin mb-3" />
              <p className="text-sm text-slate-300">Processing pipeline...</p>
              <p className="text-xs text-slate-500 mt-1">{completedSteps.size}/{PIPELINE_STEPS.length} steps complete</p>
              <div className="mt-4 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedSteps.size / PIPELINE_STEPS.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <>
              <div className="card-hover rounded-[32px] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-primary/5 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="h-6 w-6 text-emerald-400" />
                  <h3 className="text-lg font-semibold text-white">Cleaning Complete</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[10px] text-slate-500 uppercase">Rows</p>
                    <p className="text-lg font-semibold text-white">{result.rows_before} <ArrowRight className="inline h-3 w-3 text-emerald-400 mx-1" /> {result.rows_after}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[10px] text-slate-500 uppercase">Columns</p>
                    <p className="text-lg font-semibold text-white">{result.columns_before} <ArrowRight className="inline h-3 w-3 text-emerald-400 mx-1" /> {result.columns_after}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.summary && Object.entries(result.summary).filter(([_, v]: any) => v > 0).map(([k, v]: any) => (
                    <span key={k} className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] text-emerald-300">
                      {k.replace(/_/g, ' ')}: {v}
                    </span>
                  ))}
                </div>
              </div>

              {/* Operations log */}
              <div className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-4 w-4 text-accent" />
                  <h3 className="text-sm font-semibold text-white">Operation Log ({result.applied_operations?.length || 0} steps)</h3>
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {result.applied_operations?.map((op: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-400 py-1.5 border-b border-white/5 last:border-0">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                      <span>{op}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Download */}
              <a
                href={downloadUrl(`/datasets/${encodeURIComponent(result.cleaned_file)}/download`)}
                download={result.cleaned_file}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                <Download className="h-4 w-4" /> Download cleaned dataset
              </a>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
