import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Play, Save, Zap, Loader2, Trash2, Eye, ChevronDown, ChevronUp, Clock, CheckCircle, XCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { api } from '../lib/api';
import { useUIStore } from '../store/useUIStore';
import { useNotificationStore } from '../store/useNotificationStore';

interface Run {
  id: string;
  pipeline_id: string;
  status: string;
  current_step: string | null;
  results: any;
  error: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string | null;
}

function PipelineRunsPanel({ pipelineId }: { pipelineId: string }) {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    api.pipelines.runs(pipelineId).then(r => setRuns(r.runs)).catch(() => {}).finally(() => setLoading(false));
  }, [pipelineId]);

  if (loading) return <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin text-slate-400" /></div>;
  if (runs.length === 0) return <p className="text-xs text-slate-500 py-4 text-center">No runs yet.</p>;

  return (
    <div className="space-y-1.5">
      {runs.map(run => (
        <div key={run.id} className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
          <button onClick={() => setExpanded(expanded === run.id ? null : run.id)} className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              {run.status === 'completed' ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                : run.status === 'failed' ? <XCircle className="h-3.5 w-3.5 text-danger" />
                : run.status === 'running' ? <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                : <AlertCircle className="h-3.5 w-3.5 text-yellow-400" />}
              <span className="text-xs font-medium text-white capitalize">{run.status}</span>
              <span className="text-[10px] text-slate-500">{run.current_step || '—'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-600">{run.started_at ? new Date(run.started_at).toLocaleString() : ''}</span>
              {expanded === run.id ? <ChevronUp className="h-3 w-3 text-slate-500" /> : <ChevronDown className="h-3 w-3 text-slate-500" />}
            </div>
          </button>
          {expanded === run.id && (
            <div className="mt-2 border-t border-white/5 pt-2 text-[11px] text-slate-400 space-y-1">
              {run.error && <p className="text-danger">Error: {run.error}</p>}
              {run.results?.state_keys?.length > 0 && <p>State: {run.results.state_keys.join(', ')}</p>}
              {run.completed_at && <p>Completed: {new Date(run.completed_at).toLocaleString()}</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function PipelinesPage() {
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [showRunsFor, setShowRunsFor] = useState<string | null>(null);
  const setActivePage = useUIStore((s) => s.setActivePage);
  const notify = useNotificationStore((s) => s.add);

  const load = () => {
    setLoading(true);
    api.pipelines.list().then(r => setPipelines(r.pipelines)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRun = async (id: string) => {
    setRunningId(id);
    try {
      const result: any = await api.pipelines.run(id);
      notify({ title: 'Pipeline run completed', message: `Status: ${result.status}`, type: result.status === 'failed' ? 'error' : 'success' });
      load();
    } catch (err: any) {
      notify({ title: 'Run failed', message: err.message, type: 'error' });
    }
    setRunningId(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete pipeline "${name}"? This cannot be undone.`)) return;
    try {
      await api.pipelines.delete(id);
      notify({ title: 'Pipeline deleted', message: `"${name}" has been removed`, type: 'success' });
      load();
    } catch (err: any) {
      notify({ title: 'Delete failed', message: err.message, type: 'error' });
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-emerald-500/10 text-emerald-400',
      running: 'bg-blue-500/10 text-blue-400',
      failed: 'bg-danger/10 text-danger',
      draft: 'bg-zinc-500/10 text-zinc-400',
      completed: 'bg-emerald-500/10 text-emerald-400',
    };
    return styles[status] || 'bg-zinc-500/10 text-zinc-400';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6 p-6">
      <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Workflow automation</p>
            <h2 className="text-2xl font-semibold text-white">Data & training pipelines</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setActivePage('Datasets')} className="rounded-2xl bg-primary/20 px-4 py-2 text-sm font-medium text-white hover:bg-primary/30 transition-colors">
              Create pipeline
            </button>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
        ) : pipelines.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">No pipelines yet. Create one to get started.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pipelines.map((pipeline: any) => (
              <div key={pipeline.id} className="rounded-[28px] border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
                <div className="mb-3 flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white truncate">{pipeline.name}</p>
                    <p className="text-sm text-slate-400">{pipeline.steps?.length || 0} steps</p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => handleDelete(pipeline.id, pipeline.name)}
                      className="p-1.5 rounded-lg hover:bg-white/[0.05] text-slate-500 hover:text-danger transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium inline-block ${getStatusBadge(pipeline.status)}`}>
                  {pipeline.status}
                </div>
                {pipeline.description && (
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{pipeline.description}</p>
                )}
                {pipeline.steps?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {pipeline.steps.map((s: any, i: number) => (
                      <span key={i} className="rounded-lg bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
                        {s.type || '?'}
                      </span>
                    ))}
                  </div>
                )}
                {pipeline.schedule && (
                  <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">
                    <Clock className="h-3 w-3" /> {pipeline.schedule}
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleRun(pipeline.id)}
                    disabled={runningId === pipeline.id}
                    className="flex-1 rounded-2xl bg-primary/20 px-3 py-2 text-sm font-medium text-white hover:bg-primary/30 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-1"
                  >
                    {runningId === pipeline.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                    Run
                  </button>
                  <button
                    onClick={() => setShowRunsFor(showRunsFor === pipeline.id ? null : pipeline.id)}
                    className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-1"
                  >
                    <Eye className="h-3.5 w-3.5" /> Runs
                  </button>
                </div>
                {showRunsFor === pipeline.id && (
                  <div className="mt-3 border-t border-white/10 pt-3">
                    <PipelineRunsPanel pipelineId={pipeline.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Visual builder</p>
              <h3 className="text-lg font-semibold text-white">Pipeline editor</h3>
            </div>
            <GitBranch className="h-5 w-5 text-primary" />
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-6">
            <div className="space-y-4">
              {['Data Source', 'Transformation', 'Feature Engineering', 'Training', 'Evaluation'].map((step, idx) => (
                <div key={step}>
                  <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-center text-sm font-medium text-white">
                    {step}
                  </div>
                  {idx < 4 && (
                    <div className="flex justify-center py-2">
                      <div className="h-8 w-1 bg-gradient-to-b from-primary to-accent" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Controls</p>
              <h3 className="text-lg font-semibold text-white">Actions</h3>
            </div>
            <Zap className="h-5 w-5 text-accent" />
          </div>
          <div className="space-y-3">
            <button onClick={() => setActivePage('Training')} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">
              <Play className="h-4 w-4" /> Run training
            </button>
            <button onClick={() => setActivePage('Datasets')} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">
              <Save className="h-4 w-4" /> Add data source
            </button>
            <button onClick={() => setActivePage('Experiments')} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">
              <GitBranch className="h-4 w-4" /> View history
            </button>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

export default PipelinesPage;
