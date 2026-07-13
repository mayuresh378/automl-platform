import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Star, Database, FlaskConical, Rocket, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { useUIStore } from '../store/useUIStore';
import { Button } from '../components/Button';
import { staggerContainer, staggerItem } from '../lib/animations';

function ProjectsPage() {
  const [experiments, setExperiments] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const setActivePage = useUIStore((s) => s.setActivePage);

  useEffect(() => {
    Promise.all([
      api.experiments.list().then(r => setExperiments(r.experiments)).catch(() => {}),
      api.models.list().then(r => setModels(r.models)).catch(() => {}),
      api.projects.list().then(r => setProjects(r.projects)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const successful = experiments.filter(e => e.status === 'success').length;

  const statCards = [
    { label: 'Experiments', value: experiments.length, icon: FlaskConical },
    { label: 'Successful runs', value: successful, icon: FolderOpen },
    { label: 'Trained models', value: models.length, icon: Database },
    { label: 'Deployments', value: models.filter((m: any) => m.status === 'production' || m.status === 'active').length, icon: Rocket },
  ];

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 p-6">
      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
      ) : (
        <>
          <motion.div variants={staggerItem} className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="card-hover rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">{stat.label}</span>
                    <Icon className="h-4 w-4 text-accent" />
                  </div>
                  <p className="text-2xl font-semibold text-white">{stat.value}</p>
                </div>
              );
            })}
          </motion.div>

          <motion.section variants={staggerItem} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Workspace organization</p>
                <h2 className="text-2xl font-semibold text-white">Active projects</h2>
              </div>
              <Button onClick={() => setActivePage('Datasets')}>
                New project
              </Button>
            </div>
            {projects.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">No projects yet. Upload a dataset to start.</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project: any) => (
                  <div key={project.id} className="rounded-[28px] border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <p className="font-medium text-white">{project.name}</p>
                        <p className="text-sm text-slate-400">{project.model_ids?.length || 0} models</p>
                      </div>
                      <button className="btn-press rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:text-white">
                        <Star className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">{project.status || 'Development'}</div>
                      <span className="text-sm text-slate-500">{project.created_at ? new Date(project.created_at).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.section>

          <motion.section variants={staggerItem} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Quick actions</p>
                <h3 className="text-lg font-semibold text-white">Get started</h3>
              </div>
              <FolderOpen className="h-5 w-5 text-accent" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <button onClick={() => setActivePage('Datasets')} className="btn-press rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">Upload a dataset</button>
              <button onClick={() => setActivePage('Training')} className="btn-press rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">Start a new training run</button>
              <button onClick={() => setActivePage('Experiments')} className="btn-press rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">View recent experiments</button>
              <button onClick={() => setActivePage('Dashboard')} className="btn-press rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">Go to dashboard</button>
            </div>
          </motion.section>
        </>
      )}
    </motion.div>
  );
}

export default ProjectsPage;