import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Database, FlaskConical, Boxes, Rocket, StickyNote, ArrowLeft, Loader2, BarChart3, CheckCircle2, XCircle, Clock, Zap, ExternalLink, Download, Trash2, Play } from 'lucide-react';
import { api, downloadUrl } from '../lib/api';
import { useUIStore } from '../store/useUIStore';
import { staggerContainer, staggerItem } from '../lib/animations';

const TABS = [
  { id: 'overview', label: 'Overview', icon: FolderOpen },
  { id: 'datasets', label: 'Datasets', icon: Database },
  { id: 'experiments', label: 'Experiments', icon: FlaskConical },
  { id: 'models', label: 'Models', icon: Boxes },
  { id: 'deployments', label: 'Deployments', icon: Rocket },
  { id: 'notes', label: 'Notes', icon: StickyNote },
];

function ProjectDetailPage() {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const notesTimer = useRef<any>(null);
  const setActivePage = useUIStore(s => s.setActivePage);
  const currentProjectId = useUIStore(s => s.currentProjectId);

  const loadProject = () => {
    if (!currentProjectId) { setError('No project selected'); setLoading(false); return; }
    setLoading(true);
    setError('');
    api.projects.get(currentProjectId).then((p) => {
      setProject(p);
      setNotes(p.notes || '');
    }).catch(e => setError(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => { loadProject(); }, [currentProjectId]);

  const saveNotes = () => {
    if (!currentProjectId) return;
    setSavingNotes(true);
    api.projects.updateNotes(currentProjectId, notes).finally(() => setSavingNotes(false));
  };

  const handleNotesChange = (val: string) => {
    setNotes(val);
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(saveNotes, 1000);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>;
  if (error) return (
    <div className="p-6 space-y-4">
      <button onClick={() => setActivePage('Projects')} className="btn-press rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" /></button>
      <div className="text-red-400">{error}</div>
    </div>
  );
  if (!project) return <div className="p-6 text-slate-400">Project not found</div>;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setActivePage('Projects')} className="btn-press rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" /></button>
          <div>
            <p className="text-xs text-slate-500">Project workspace</p>
            <h1 className="text-2xl font-semibold text-white">{project.name}</h1>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">{project.status || 'Development'}</span>
        </div>
        {project.description && (
          <p className="text-sm text-slate-400 max-w-xl">{project.description}</p>
        )}
      </div>

      <motion.div variants={staggerItem} className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {[
          { label: 'Datasets', value: project.dataset_count || 0, icon: Database, color: 'text-blue-400' },
          { label: 'Experiments', value: project.experiment_count || 0, icon: FlaskConical, color: 'text-emerald-400' },
          { label: 'Models', value: project.model_count || 0, icon: Boxes, color: 'text-purple-400' },
          { label: 'Deployments', value: project.deployment_count || 0, icon: Rocket, color: 'text-amber-400' },
          { label: 'Created', value: project.created_at ? new Date(project.created_at).toLocaleDateString() : '-', icon: Clock, color: 'text-slate-400' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card-hover rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">{s.label}</span>
                <Icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className="text-2xl font-semibold text-white">{s.value}</p>
            </div>
          );
        })}
      </motion.div>

      <motion.div variants={staggerItem} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 overflow-hidden">
        <div className="flex border-b border-white/10 overflow-x-auto scrollbar-thin">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'text-accent border-b-2 border-accent bg-white/5'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {tab === 'overview' && (
            <div className="space-y-6">
              <p className="text-sm text-slate-400">Project summary — all resources in this workspace.</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <button onClick={() => setTab('datasets')} className="btn-press rounded-3xl border border-white/10 bg-white/5 p-5 text-left transition hover:bg-white/10 hover:border-blue-400/30">
                  <Database className="h-6 w-6 text-blue-400 mb-2" />
                  <p className="text-lg font-semibold text-white">{project.dataset_count || 0}</p>
                  <p className="text-sm text-slate-400">Datasets</p>
                </button>
                <button onClick={() => setTab('experiments')} className="btn-press rounded-3xl border border-white/10 bg-white/5 p-5 text-left transition hover:bg-white/10 hover:border-emerald-400/30">
                  <FlaskConical className="h-6 w-6 text-emerald-400 mb-2" />
                  <p className="text-lg font-semibold text-white">{project.experiment_count || 0}</p>
                  <p className="text-sm text-slate-400">Experiments</p>
                </button>
                <button onClick={() => setTab('models')} className="btn-press rounded-3xl border border-white/10 bg-white/5 p-5 text-left transition hover:bg-white/10 hover:border-purple-400/30">
                  <Boxes className="h-6 w-6 text-purple-400 mb-2" />
                  <p className="text-lg font-semibold text-white">{project.model_count || 0}</p>
                  <p className="text-sm text-slate-400">Models</p>
                </button>
                <button onClick={() => setTab('deployments')} className="btn-press rounded-3xl border border-white/10 bg-white/5 p-5 text-left transition hover:bg-white/10 hover:border-amber-400/30">
                  <Rocket className="h-6 w-6 text-amber-400 mb-2" />
                  <p className="text-lg font-semibold text-white">{project.deployment_count || 0}</p>
                  <p className="text-sm text-slate-400">Deployments</p>
                </button>
              </div>
            </div>
          )}

          {tab === 'datasets' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-400">{project.dataset_count || 0} datasets in this project</p>
                <button onClick={() => setActivePage('Datasets')} className="btn-press flex items-center gap-1 text-xs text-primary hover:text-primary/80">
                  <ExternalLink className="h-3 w-3" /> Browse all datasets
                </button>
              </div>
              {project.datasets?.length > 0 ? (
                <div className="space-y-2">
                  {project.datasets.map((d: any) => (
                    <div key={d.name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-white">{d.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{d.rows?.toLocaleString() || '?'} rows</span>
                        <span>{d.columns?.length || '?'} cols</span>
                        {d.size_kb && <span>{d.size_kb >= 1024 ? `${(d.size_kb / 1024).toFixed(1)} MB` : `${d.size_kb} KB`}</span>}
                        <a href={downloadUrl(`/datasets/${encodeURIComponent(d.name)}/download`)} download={d.name} className="text-emerald-400 hover:text-emerald-300"><Download className="h-3.5 w-3.5" /></a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-slate-500">
                  No datasets yet.
                  <button onClick={() => setActivePage('Datasets')} className="btn-press text-primary ml-1 hover:text-primary/80">Upload one</button>
                </div>
              )}
            </div>
          )}

          {tab === 'experiments' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-400">{project.experiment_count || 0} experiments in this project</p>
                <button onClick={() => setActivePage('Experiments')} className="btn-press flex items-center gap-1 text-xs text-primary hover:text-primary/80">
                  <ExternalLink className="h-3 w-3" /> All experiments
                </button>
              </div>
              {project.experiments?.length > 0 ? (
                <div className="space-y-2">
                  {project.experiments.map((e: any) => (
                    <div key={e.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        {e.status === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> : <XCircle className="h-4 w-4 text-red-400 shrink-0" />}
                        <div className="min-w-0">
                          <p className="text-sm text-white truncate">{e.name || e.model}</p>
                          <p className="text-xs text-slate-500">{e.dataset || ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs shrink-0">
                        <span className="text-slate-500">{e.model}</span>
                        <span className="text-accent font-mono">{e.cv_score ? `${(e.cv_score * 100).toFixed(1)}%` : '?'}</span>
                        {e.created_at && <span className="text-slate-600">{new Date(e.created_at).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-slate-500">
                  No experiments yet.
                  <button onClick={() => setActivePage('Training')} className="btn-press text-primary ml-1 hover:text-primary/80">Run training</button>
                </div>
              )}
            </div>
          )}

          {tab === 'models' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-400">{project.model_count || 0} models in this project</p>
                <button onClick={() => setActivePage('Models')} className="btn-press flex items-center gap-1 text-xs text-primary hover:text-primary/80">
                  <ExternalLink className="h-3 w-3" /> Model registry
                </button>
              </div>
              {project.models?.length > 0 ? (
                <div className="space-y-2">
                  {project.models.map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Boxes className="h-4 w-4 text-purple-400" />
                        <span className="text-sm text-white">{m.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-slate-500">{m.model_type}</span>
                        <span className={`rounded-full px-2 py-0.5 ${m.status === 'production' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/10 text-slate-400'}`}>{m.status}</span>
                        <span className="text-accent font-mono">{m.cv_score ? `${(m.cv_score * 100).toFixed(1)}%` : '?'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-slate-500">No models registered yet.</div>
              )}
            </div>
          )}

          {tab === 'deployments' && (
            <div>
              <p className="text-sm text-slate-400 mb-4">{project.deployment_count || 0} deployments in this project</p>
              {project.deployments?.length > 0 ? (
                <div className="space-y-2">
                  {project.deployments.map((d: any) => (
                    <div key={d.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Rocket className="h-4 w-4 text-amber-400" />
                        <span className="text-sm text-white">{d.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-slate-500">{d.environment}</span>
                        <span className={`rounded-full px-2 py-0.5 ${d.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/10 text-slate-400'}`}>{d.status}</span>
                        {d.endpoint_url && <span className="text-slate-500 font-mono text-[10px]">{d.endpoint_url}</span>}
                        {d.created_at && <span className="text-slate-600">{new Date(d.created_at).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-slate-500">
                  No deployments yet.
                  <button onClick={() => setActivePage('Deployment')} className="btn-press text-primary ml-1 hover:text-primary/80">Deploy a model</button>
                </div>
              )}
            </div>
          )}

          {tab === 'notes' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-400">Project notes (auto-saved)</p>
                {savingNotes && <span className="text-xs text-slate-500 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Saving...</span>}
              </div>
              <textarea
                value={notes}
                onChange={e => handleNotesChange(e.target.value)}
                placeholder="Add notes about this project — observations, hypotheses, next steps..."
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-accent/40 min-h-[200px] resize-y"
              />
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-slate-600">Last saved {project.updated_at ? new Date(project.updated_at).toLocaleString() : 'never'}</p>
                <button onClick={saveNotes} className="btn-press text-xs text-primary hover:text-primary/80">Save now</button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ProjectDetailPage;
