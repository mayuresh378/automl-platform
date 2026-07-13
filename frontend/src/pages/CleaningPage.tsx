import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, SlidersHorizontal, RefreshCw, CheckCircle2, Undo2, Download, XCircle, Loader2, Clock, AlertTriangle } from 'lucide-react';
import { api, downloadUrl } from '../lib/api';
import { useNotificationStore } from '../store/useNotificationStore';

function CleaningPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selected, setSelected] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [runningAll, setRunningAll] = useState(false);
  const [actionStates, setActionStates] = useState<Record<string, { running: boolean; done: boolean; error?: string; result?: any }>>({});
  const [history, setHistory] = useState<{ action: string; timestamp: string }[]>([]);
  const notify = useNotificationStore((s) => s.add);

  useEffect(() => {
    api.datasets.list().then(r => setDatasets(r.datasets)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selected) { setProfile(null); setResult(null); setHistory([]); setActionStates({}); return; }
    api.datasets.profile(selected).then(setProfile).catch(() => setProfile(null));
  }, [selected]);

  const actions = [
    {
      key: 'impute_missing',
      label: 'Impute missing values (median)',
      desc: profile ? `${profile.column_details?.filter((c: any) => c.missing > 0).length || 0} columns with nulls` : '',
      ops: [{ type: 'impute_missing', strategy: 'median', columns: [] }],
      disabled: profile ? profile.column_details?.filter((c: any) => c.missing > 0).length === 0 : true,
    },
    {
      key: 'encode_categorical',
      label: 'Encode categorical columns',
      desc: profile ? `${profile.column_details?.filter((c: any) => c.dtype === 'object').length || 0} object columns` : '',
      ops: [{ type: 'encode_categorical', columns: profile?.column_details?.filter((c: any) => c.dtype === 'object').map((c: any) => c.name) || [] }],
      disabled: profile ? profile.column_details?.filter((c: any) => c.dtype === 'object').length === 0 : true,
    },
    {
      key: 'scale_numeric',
      label: 'Scale numeric features (standard)',
      desc: profile ? `${profile.column_details?.filter((c: any) => c.dtype in ['int64', 'float64']).length || 0} numeric columns` : '',
      ops: [{ type: 'scale_numeric', strategy: 'standard', columns: profile?.column_details?.filter((c: any) => c.dtype in ['int64', 'float64']).map((c: any) => c.name) || [] }],
      disabled: profile ? profile.column_details?.filter((c: any) => c.dtype in ['int64', 'float64']).length === 0 : true,
    },
    {
      key: 'remove_outliers',
      label: 'Remove sparse outliers',
      desc: profile ? `${profile.column_details?.reduce((s: number, c: any) => s + (c.outliers || 0), 0) || 0} outlier rows flagged` : '',
      ops: [{ type: 'remove_outliers', columns: profile?.column_details?.filter((c: any) => c.outliers > 0).map((c: any) => c.name) || [] }],
      disabled: profile ? profile.column_details?.filter((c: any) => c.outliers > 0).length === 0 : true,
    },
  ];

  const applyAction = async (action: typeof actions[0]) => {
    if (!selected) return;
    setActionStates(prev => ({ ...prev, [action.key]: { running: true, done: false } }));
    try {
      const res = await api.datasets.clean(selected, action.ops);
      setActionStates(prev => ({ ...prev, [action.key]: { running: false, done: true, result: res } }));
      setResult(res);
      setHistory(prev => [{ action: action.label, timestamp: new Date().toLocaleTimeString() }, ...prev]);
      notify({ title: `Cleaning: ${action.label}`, message: `Applied to ${selected}`, type: 'success' });
    } catch (err: any) {
      setActionStates(prev => ({ ...prev, [action.key]: { running: false, done: false, error: err.message } }));
      notify({ title: `Cleaning failed: ${action.label}`, message: err.message, type: 'error' });
    }
  };

  const applyAll = async () => {
    if (!selected) return;
    setRunningAll(true);
    setResult(null);
    let count = 0;
    for (const a of actions) {
      if (a.disabled) continue;
      setActionStates(prev => ({ ...prev, [a.key]: { running: true, done: false } }));
      try {
        const res = await api.datasets.clean(selected, a.ops);
        setActionStates(prev => ({ ...prev, [a.key]: { running: false, done: true, result: res } }));
        setResult(res);
        setHistory(prev => [{ action: a.label, timestamp: new Date().toLocaleTimeString() }, ...prev]);
        count++;
      } catch (err: any) {
        setActionStates(prev => ({ ...prev, [a.key]: { running: false, done: false, error: err.message } }));
        notify({ title: `Cleaning failed: ${a.label}`, message: err.message, type: 'error' });
      }
    }
    if (count > 0) notify({ title: `Cleaning complete`, message: `${count} actions applied to ${selected}`, type: 'success' });
    setRunningAll(false);
  };

  const resetAll = () => {
    setResult(null);
    setActionStates({});
    setHistory([]);
  };

  const pendingCount = actions.filter(a => {
    const s = actionStates[a.key];
    return !s?.done && !a.disabled;
  }).length;

  const doneCount = actions.filter(a => {
    const s = actionStates[a.key];
    return s?.done;
  }).length;

  const hasMissing = profile ? profile.column_details?.filter((c: any) => c.missing > 0).length > 0 : false;
  const hasOutliers = profile ? profile.column_details?.reduce((s: number, c: any) => s + (c.outliers || 0), 0) > 0 : false;
  const dataQuality = profile
    ? Math.round(100 - (profile.missing_pct || 0) - (profile.duplicates / Math.max(profile.rows, 1)) * 50 - (hasOutliers ? 8 : 0))
    : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
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
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Data quality score</p>
              <p className="mt-2 text-2xl font-semibold text-white">{Math.max(0, dataQuality)}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Missing values</p>
              <p className="mt-2 text-2xl font-semibold text-white">{profile.missing_pct}%</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Duplicates</p>
              <p className="mt-2 text-2xl font-semibold text-white">{profile.duplicates}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Rows / Columns</p>
              <p className="mt-2 text-2xl font-semibold text-white">{profile.rows} <span className="text-sm text-slate-500">/ {profile.columns}</span></p>
            </div>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <Sparkles className="h-4 w-4 text-accent" />
                Recommended actions
              </div>
              {profile && (
                <span className="text-[11px] text-slate-500">
                  {doneCount}/{actions.filter(a => !a.disabled).length} done
                </span>
              )}
            </div>
            <div className="space-y-2.5">
              {actions.map((action) => {
                const state = actionStates[action.key];
                const isRunning = state?.running || false;
                const isDone = state?.done || false;
                const hasError = state?.error;

                return (
                  <div key={action.key} className={`rounded-2xl border px-4 py-3 text-sm transition-colors ${
                    isDone ? 'border-emerald-500/20 bg-emerald-500/5' :
                    hasError ? 'border-danger/20 bg-danger/5' :
                    'border-white/10 bg-[#111827]/70'
                  }`}>
                    <div className={`flex items-center justify-between ${isDone ? 'text-emerald-300' : 'text-slate-300'}`}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isRunning ? (
                          <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
                        ) : isDone ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        ) : hasError ? (
                          <XCircle className="h-4 w-4 text-danger shrink-0" />
                        ) : (
                          <span className="h-4 w-4 rounded-full border border-slate-600 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate">{action.label}</p>
                          {action.desc && !isDone && (
                            <p className="text-[11px] text-slate-500 truncate">{action.desc}</p>
                          )}
                          {isDone && state?.result?.applied_operations && (
                            <p className="text-[10px] text-emerald-500/70 truncate">
                              {state.result.applied_operations.slice(0, 2).join(', ')}
                              {state.result.applied_operations.length > 2 ? ` +${state.result.applied_operations.length - 2} more` : ''}
                            </p>
                          )}
                          {hasError && <p className="text-[10px] text-danger/70 truncate">{hasError}</p>}
                        </div>
                      </div>
                      <button
                        onClick={() => applyAction(action)}
                        disabled={isRunning || action.disabled}
                        className={`rounded-xl px-3 py-1 text-xs font-medium transition-colors shrink-0 ml-2 ${
                          isDone
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isRunning
                            ? 'bg-primary/10 text-primary/50'
                            : action.disabled
                            ? 'bg-white/5 text-slate-600 cursor-not-allowed'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {isRunning ? 'Running…' : isDone ? 'Applied' : 'Apply'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {profile && (
              <div className="mt-4 flex items-center gap-2">
                <button onClick={applyAll} disabled={runningAll || pendingCount === 0}
                  className={`flex-1 rounded-2xl py-2.5 text-sm font-medium transition-opacity ${
                    runningAll
                      ? 'bg-primary/20 text-primary/50'
                      : 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90'
                  } disabled:opacity-50`}>
                  {runningAll ? (
                    <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Applying all…</span>
                  ) : (
                    `Apply remaining (${pendingCount})`
                  )}
                </button>
                {doneCount > 0 && (
                  <button onClick={resetAll} className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm text-slate-400 hover:text-white transition-colors">
                    <Undo2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-primary/10 to-accent/10 p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-200">
              <RefreshCw className={`h-4 w-4 text-primary ${runningAll ? 'animate-spin' : ''}`} />
              {result ? 'Cleaning result' : 'Preview summary'}
            </div>

            {history.length > 0 && (
              <div className="mb-4 rounded-2xl bg-white/5 p-3">
                <p className="text-[10px] font-medium text-slate-500 mb-2 flex items-center gap-1"><Clock className="h-3 w-3" /> Operation history</p>
                <div className="space-y-1">
                  {history.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-slate-400">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                      <span className="truncate">{h.action}</span>
                      <span className="text-[9px] text-slate-600 shrink-0">{h.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result ? (
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3"><span>Rows after</span><span className="font-semibold text-white">{result.rows_after}</span></div>
                <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3"><span>Features retained</span><span className="font-semibold text-white">{result.columns_after}</span></div>
                <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3"><span>Saved as</span><span className="text-primary font-mono text-xs">{result.cleaned_file}</span></div>
                <a href={downloadUrl(`/datasets/${encodeURIComponent(result.cleaned_file)}/download`)} download={result.cleaned_file} className="btn-press flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity">
                  <Download className="h-4 w-4" /> Download cleaned dataset
                </a>
              </div>
            ) : profile ? (
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3"><span>Rows</span><span>{profile.rows}</span></div>
                <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3"><span>Columns</span><span>{profile.columns}</span></div>
                <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3"><span>Missing</span><span className={profile.missing_pct > 5 ? 'text-amber-400' : 'text-emerald-400'}>{profile.missing_pct}%</span></div>
                {hasMissing && (
                  <div className="flex items-center gap-2 rounded-2xl bg-amber-500/10 px-4 py-2 text-xs text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>{profile.column_details?.filter((c: any) => c.missing > 0).length} columns have missing values</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Select a dataset to see its profile</p>
            )}
          </div>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Pipeline</p>
              <h3 className="text-lg font-semibold text-white">Bulk actions</h3>
            </div>
            <SlidersHorizontal className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-3">
            {[
              { label: 'Apply all cleaning steps', ops: actions.map(a => a.ops[0]).filter(Boolean), onClick: applyAll, disabled: !selected || runningAll || pendingCount === 0 },
              { label: 'Reset and start over', onClick: resetAll, disabled: doneCount === 0, variant: 'reset' as const },
            ].map((btn) => (
              <button key={btn.label} onClick={btn.onClick} disabled={btn.disabled}
                className={`w-full rounded-2xl px-4 py-3 text-sm font-medium transition-colors disabled:opacity-40 ${
                  btn.variant === 'reset'
                    ? 'border border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.03]'
                    : 'bg-primary/20 text-white hover:bg-primary/30'
                }`}>
                {btn.label}
              </button>
            ))}
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
            <p className="mb-2">Cleaned datasets are saved as <code className="text-primary">cleaned_*.csv</code>.</p>
            <p className="text-xs text-slate-500">Each action creates a new cleaned file. Download from the result panel above.</p>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

export default CleaningPage;
