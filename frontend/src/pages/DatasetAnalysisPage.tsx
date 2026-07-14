import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, TrendingUp, AlertTriangle, ShieldAlert, Target, BarChart3,
  Activity, CheckCircle2, BrainCircuit, Loader2, ArrowRight, Database,
  Columns, Table2, AlertCircle, Info, ChevronRight, Flame, Layers,
  GitCompare, Gauge, Percent, RefreshCw
} from 'lucide-react';
import { useDatasets, useDatasetAnalysis } from '../hooks/useApi';
import { staggerContainer, staggerItem } from '../lib/animations';
import { Button } from '../components/Button';

function DatasetAnalysisPage() {
  const { data: datasets = [] } = useDatasets();
  const [selected, setSelected] = useState<string>('');
  const [target, setTarget] = useState<string>('');

  const { data: analysis, isFetching, error } = useDatasetAnalysis(selected, target || undefined);

  const qs = analysis?.quality_score;

  const gradeColor = (g?: string) => {
    if (!g) return 'text-zinc-500';
    if (g === 'A') return 'text-emerald-400';
    if (g === 'B') return 'text-blue-400';
    if (g === 'C') return 'text-amber-400';
    if (g === 'D') return 'text-orange-400';
    return 'text-red-400';
  };

  const severityColor = (s?: string) => {
    if (s === 'low') return 'bg-emerald-500/10 text-emerald-400';
    if (s === 'medium') return 'bg-amber-500/10 text-amber-400';
    if (s === 'high') return 'bg-red-500/10 text-red-400';
    return 'bg-zinc-500/10 text-zinc-400';
  };

  const priorityColor = (p?: string) => {
    if (p === 'high') return 'border-red-500/30 bg-red-500/5';
    if (p === 'medium') return 'border-amber-500/30 bg-amber-500/5';
    return 'border-blue-500/30 bg-blue-500/5';
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 p-6">
      <motion.div variants={staggerItem} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-400">AI-powered analysis</p>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-3">
            <BrainCircuit className="h-6 w-6 text-accent" />
            Dataset Analysis
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selected}
            onChange={(e) => { setSelected(e.target.value); setTarget(''); }}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-accent/40"
          >
            <option value="">Select a dataset...</option>
            {datasets.map((d: any) => (
              <option key={d.name} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {!selected && (
        <motion.div variants={staggerItem} className="flex flex-col items-center justify-center py-20 text-center">
          <BrainCircuit className="h-16 w-16 text-accent/30 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Select a dataset to analyze</h2>
          <p className="text-sm text-slate-400 max-w-md">Get AI-powered insights about data quality, missing values, correlations, outliers, and recommendations.</p>
        </motion.div>
      )}

      {isFetching && selected && (
        <motion.div variants={staggerItem} className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-3" />
            <p className="text-sm text-slate-400">Analyzing dataset...</p>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div variants={staggerItem} className="rounded-[28px] border border-red-500/30 bg-red-500/10 p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-400">{(error as any).message || 'Analysis failed'}</p>
        </motion.div>
      )}

      {analysis && !isFetching && (
        <>
          <motion.div variants={staggerItem} className="grid gap-4 grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            <div className="card-hover rounded-[28px] border border-white/10 bg-white/5 p-5 col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-1">
                <Database className="h-4 w-4 text-accent" />
                <span className="text-[10px] uppercase tracking-wider text-slate-500">Dataset</span>
              </div>
              <p className="text-lg font-semibold text-white truncate">{analysis.name}</p>
            </div>
            <div className="card-hover rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2 mb-1">
                <Table2 className="h-4 w-4 text-blue-400" />
                <span className="text-[10px] uppercase tracking-wider text-slate-500">Rows</span>
              </div>
              <p className="text-lg font-semibold text-white">{(analysis.rows || 0).toLocaleString()}</p>
            </div>
            <div className="card-hover rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2 mb-1">
                <Columns className="h-4 w-4 text-emerald-400" />
                <span className="text-[10px] uppercase tracking-wider text-slate-500">Columns</span>
              </div>
              <p className="text-lg font-semibold text-white">{analysis.columns}</p>
            </div>
            <div className="card-hover rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-rose-400" />
                <span className="text-[10px] uppercase tracking-wider text-slate-500">Target</span>
              </div>
              <p className="text-lg font-semibold text-white truncate">{analysis.target || 'Auto-detect'}</p>
            </div>
            <div className="card-hover rounded-[28px] border border-white/10 bg-white/5 p-5 col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-1">
                <Gauge className="h-4 w-4 text-amber-400" />
                <span className="text-[10px] uppercase tracking-wider text-slate-500">Health Score</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="h-10 w-10 -rotate-90 shrink-0" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.5" fill="none"
                    stroke={qs?.total >= 90 ? '#22C55E' : qs?.total >= 80 ? '#3B82F6' : qs?.total >= 65 ? '#F59E0B' : '#EF4444'}
                    strokeWidth="3" strokeDasharray={`${(qs?.total || 0) * 0.31} 100`} strokeLinecap="round"
                  />
                </svg>
                <div>
                  <span className={`text-lg font-semibold ${gradeColor(qs?.grade)}`}>{qs?.grade || '?'}</span>
                  <span className="text-sm text-slate-400 ml-1">({qs?.total || '?'}/100)</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={staggerItem} className="grid gap-6 xl:grid-cols-2">
            <div className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-accent" />
                  <h3 className="text-lg font-semibold text-white">AI Insights</h3>
                </div>
                <Sparkles className="h-4 w-4 text-amber-400" />
              </div>
              <div className="space-y-2">
                {analysis.insights?.map((insight: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <ChevronRight className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-rose-400" />
                  <h3 className="text-lg font-semibold text-white">Target Detection</h3>
                </div>
                <Info className="h-4 w-4 text-slate-500" />
              </div>
              {analysis.target_detection?.candidates?.length > 0 ? (
                <div className="space-y-2">
                  {analysis.target_detection.candidates.map((c: any, i: number) => (
                    <button
                      key={c.column}
                      onClick={() => setTarget(c.column)}
                      className={`w-full flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${
                        target === c.column
                          ? 'border-accent/40 bg-accent/10 text-white'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {i === 0 && <Flame className="h-4 w-4 text-amber-400" />}
                        <span className={i === 0 ? 'font-medium' : ''}>{c.column}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Score: {c.score}</span>
                        {target === c.column && <CheckCircle2 className="h-4 w-4 text-accent" />}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Could not auto-detect target column.</p>
              )}
            </div>
          </motion.div>

          <motion.div variants={staggerItem} className="grid gap-6 xl:grid-cols-3">
            <div className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-semibold text-white">Missing Values</h3>
              </div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-slate-400">Total missing</span>
                <span className="text-lg font-semibold text-white">{analysis.missing?.total_missing?.toLocaleString() || 0}</span>
              </div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-slate-400">% missing</span>
                <span className={`text-lg font-semibold ${analysis.missing?.missing_pct > 10 ? 'text-red-400' : analysis.missing?.missing_pct > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {analysis.missing?.missing_pct || 0}%
                </span>
              </div>
              {analysis.missing?.columns?.length > 0 && (
                <div className="mt-3 space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin">
                  {analysis.missing.columns.map((c: any) => (
                    <div key={c.column} className="flex items-center justify-between text-xs text-slate-400 bg-white/5 rounded-xl px-3 py-2">
                      <span className="truncate">{c.column}</span>
                      <span className="text-slate-500">{c.missing} ({c.pct}%)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
              <div className="flex items-center gap-2 mb-4">
                <GitCompare className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Duplicates</h3>
              </div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-slate-400">Duplicate rows</span>
                <span className="text-lg font-semibold text-white">{analysis.duplicates?.count?.toLocaleString() || 0}</span>
              </div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-slate-400">% of data</span>
                <span className={`text-lg font-semibold ${analysis.duplicates?.severity === 'high' ? 'text-red-400' : analysis.duplicates?.severity === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {analysis.duplicates?.pct || 0}%
                </span>
              </div>
              <span className={`inline-block rounded-full px-3 py-1 text-xs ${severityColor(analysis.duplicates?.severity)}`}>
                {analysis.duplicates?.severity || 'none'}
              </span>
            </div>

            <div className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="h-5 w-5 text-orange-400" />
                <h3 className="text-lg font-semibold text-white">Outliers</h3>
              </div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-slate-400">Total outliers</span>
                <span className="text-lg font-semibold text-white">{analysis.outliers?.total_outliers?.toLocaleString() || 0}</span>
              </div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-slate-400">Avg per column</span>
                <span className={`text-lg font-semibold ${analysis.outliers?.mean_pct > 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {analysis.outliers?.mean_pct || 0}%
                </span>
              </div>
              {analysis.outliers?.columns?.slice(0, 4).map((c: any) => (
                <div key={c.column} className="flex items-center justify-between text-xs text-slate-400 bg-white/5 rounded-xl px-3 py-1.5 mt-1">
                  <span className="truncate">{c.column}</span>
                  <span>{c.outliers} ({c.pct}%)</span>
                </div>
              ))}
            </div>
          </motion.div>

          {analysis.class_imbalance?.detected && (
            <motion.div variants={staggerItem} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Class Distribution</h3>
                <span className={`ml-auto rounded-full px-3 py-1 text-xs ${severityColor(analysis.class_imbalance.severity)}`}>
                  {analysis.class_imbalance.severity} imbalance
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(analysis.class_imbalance.distribution || {}).map(([cls, data]: [string, any]) => (
                  <div key={cls} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-medium text-white truncate mb-2">{cls}</p>
                    <div className="relative h-2 rounded-full bg-white/10 mb-2">
                      <div className="absolute left-0 top-0 h-full rounded-full bg-accent transition-all" style={{ width: `${data.pct}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{data.count?.toLocaleString()} rows</span>
                      <span>{data.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">Imbalance ratio: {analysis.class_imbalance.imbalance_ratio}x</p>
            </motion.div>
          )}

          {/* Distribution Histograms */}
          {analysis.distributions?.columns?.length > 0 && (
            <motion.div variants={staggerItem} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-sky-400" />
                <h3 className="text-lg font-semibold text-white">Distribution Charts</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {analysis.distributions.columns.slice(0, 6).map((col: any) => {
                  const maxBin = Math.max(...col.bins, 1);
                  return (
                    <div key={col.column} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-white truncate">{col.column}</p>
                        <span className="text-[10px] text-slate-500">skew: {col.skewness}</span>
                      </div>
                      <div className="flex items-end gap-0.5 h-20">
                        {col.bins.slice(0, 30).map((b: number, i: number) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t bg-accent/60 hover:bg-accent/80 transition-all min-w-[2px]"
                            style={{ height: `${(b / maxBin) * 100}%` }}
                            title={`${col.bin_edges[i]?.toFixed(1)}-${col.bin_edges[i + 1]?.toFixed(1)}: ${b}`}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-600 mt-1">
                        <span>{col.min}</span>
                        <span>μ={col.mean.toFixed(1)}</span>
                        <span>{col.max}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Correlation Heatmap */}
          {analysis.correlation?.columns?.length >= 2 && (
            <motion.div variants={staggerItem} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">Correlation Heatmap</h3>
                <span className="ml-auto text-[10px] text-slate-500">{analysis.correlation.size}×{analysis.correlation.size}</span>
              </div>
              <div className="overflow-x-auto">
                <div className="inline-flex flex-col min-w-0">
                  {/* Header row */}
                  <div className="flex">
                    <div className="w-24 shrink-0" />
                    {analysis.correlation.columns.map((col: string) => (
                      <div key={col} className="w-16 shrink-0 text-[9px] text-slate-500 truncate text-center px-1 mb-1" title={col}>{col}</div>
                    ))}
                  </div>
                  {/* Matrix rows */}
                  {analysis.correlation.matrix.slice(0, 12).map((row: any, i: number) => (
                    <div key={i} className="flex items-center">
                      <div className="w-24 shrink-0 text-[10px] text-slate-400 truncate pr-2 text-right" title={row.column}>{row.column}</div>
                      {analysis.correlation.columns.slice(0, 12).map((col: string) => {
                        const val = row[col];
                        if (val === undefined || val === null) return <div key={col} className="w-16 h-7 shrink-0" />;
                        const abs = Math.abs(val);
                        const r = abs > 0.7 ? 255 : abs > 0.4 ? 200 : 100;
                        const g = val > 0 ? Math.round(255 - abs * 200) : 100;
                        const b = val > 0 ? 100 : Math.round(255 - abs * 200);
                        return (
                          <div
                            key={col}
                            className="w-16 h-7 shrink-0 flex items-center justify-center text-[9px] font-mono border border-white/5"
                            style={{ backgroundColor: `rgba(${r}, ${g}, ${b}, 0.25)` }}
                            title={`${row.column} × ${col}: ${val}`}
                          >
                            <span className="text-[9px] text-slate-300">{val.toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              {/* Top correlation pairs */}
              {analysis.correlation.top_correlations?.length > 0 && (
                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {analysis.correlation.top_correlations?.slice(0, 9).map((c: any, i: number) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-slate-300 truncate">{c.x}</span>
                        <span className="text-slate-600">×</span>
                        <span className="text-slate-300 truncate">{c.y}</span>
                      </div>
                      <span className={`ml-2 font-mono shrink-0 ${Math.abs(c.value) > 0.7 ? 'text-emerald-400' : Math.abs(c.value) > 0.4 ? 'text-amber-400' : 'text-slate-500'}`}>
                        {c.value > 0 ? '+' : ''}{c.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          <motion.div variants={staggerItem} className="grid gap-6 xl:grid-cols-2">
            <div className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="h-5 w-5 text-indigo-400" />
                <h3 className="text-lg font-semibold text-white">Feature Types</h3>
              </div>
              <div className="space-y-2">
                {Object.entries(analysis.feature_types || {}).map(([type, cols]: [string, any]) => (
                  <div key={type} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium capitalize text-white">{type}</span>
                      <span className="text-xs text-slate-500">{cols.length} columns</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(cols as string[]).slice(0, 8).map((col: string) => (
                        <span key={col} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-400">{col}</span>
                      ))}
                      {(cols as string[]).length > 8 && (
                        <span className="text-[10px] text-slate-600">+{(cols as string[]).length - 8} more</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
              <div className="flex items-center gap-2 mb-4">
                <RefreshCw className="h-5 w-5 text-teal-400" />
                <h3 className="text-lg font-semibold text-white">Recommendations</h3>
              </div>
              <div className="space-y-2">
                {analysis.recommendations?.map((rec: any, i: number) => (
                  <div key={i} className={`rounded-2xl border px-4 py-3 ${priorityColor(rec.priority)}`}>
                    <div className="flex items-start gap-2">
                      <span className={`mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                        rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        rec.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>{rec.priority}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200">{rec.message}</p>
                        {rec.columns && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {rec.columns.map((col: string) => (
                              <span key={col} className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-400">{col}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {(!analysis.recommendations || analysis.recommendations.length === 0) && (
                  <p className="text-sm text-slate-500 text-center py-4">No recommendations — dataset looks clean!</p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

export default DatasetAnalysisPage;