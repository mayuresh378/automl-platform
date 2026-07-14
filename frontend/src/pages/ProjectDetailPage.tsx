import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FolderOpen, Database, FlaskConical, Boxes, Rocket, StickyNote, ArrowLeft, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { useUIStore } from '../store/useUIStore';
import { staggerContainer, staggerItem } from '../lib/animations';
import { Button } from '../components/Button';

function ProjectDetailPage() {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const setActivePage = useUIStore(s => s.setActivePage);
  const { projectId } = useParams();

  useEffect(() => {
    if (!projectId) return;
    api.projects.get(projectId).then(setProject).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [projectId]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>;
  if (error) return <div className="p-6 text-red-400">{error}</div>;
  if (!project) return <div className="p-6 text-slate-400">Project not found</div>;

  const sections = [
    { label: 'Datasets', icon: Database, count: project.dataset_count || 0, items: project.datasets || [], page: 'Datasets' },
    { label: 'Experiments', icon: FlaskConical, count: project.experiment_count || 0, items: project.experiments || [], page: 'Experiments' },
    { label: 'Models', icon: Boxes, count: project.model_ids?.length || 0, items: [], page: 'Models' },
    { label: 'Deployments', icon: Rocket, count: 0, items: [], page: 'Deployment' },
  ];

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setActivePage('Projects')} className="btn-press rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" /></button>
        <div>
          <p className="text-xs text-slate-500">Project workspace</p>
          <h1 className="text-2xl font-semibold text-white">{project.name}</h1>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">{project.status || 'Development'}</span>
      </div>

      <motion.div variants={staggerItem} className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {sections.map(s => {
          const Icon = s.icon;
          return (
            <button key={s.label} onClick={() => setActivePage(s.page)} className="card-hover rounded-[28px] border border-white/10 bg-white/5 p-5 text-left transition hover:bg-white/10 hover:border-accent/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">{s.label}</span>
                <Icon className="h-4 w-4 text-accent" />
              </div>
              <p className="text-2xl font-semibold text-white">{s.count}</p>
            </button>
          );
        })}
      </motion.div>

      {project.datasets?.length > 0 && (
        <motion.div variants={staggerItem} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Datasets in this project</h3>
          <div className="space-y-2">
            {project.datasets.map((d: any) => (
              <div key={d.name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-accent" />
                  <span className="text-sm text-white">{d.name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{d.rows || '?'} rows</span>
                  <span>{d.columns?.length || '?'} cols</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {project.experiments?.length > 0 && (
        <motion.div variants={staggerItem} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Experiments</h3>
          <div className="space-y-2">
            {project.experiments.map((e: any) => (
              <div key={e.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-white">{e.model || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-500">Score: <span className="text-accent font-mono">{e.cv_score ? (e.cv_score * 100).toFixed(1) : '?'}%</span></span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div variants={staggerItem} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="flex items-center gap-2 mb-4">
          <StickyNote className="h-5 w-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-white">Notes</h3>
        </div>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Add notes about this project..."
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-accent/40 min-h-[100px] resize-y"
        />
      </motion.div>
    </motion.div>
  );
}

export default ProjectDetailPage;