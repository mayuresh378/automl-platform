import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Star, Database, FlaskConical, Rocket, Users } from 'lucide-react';
import { api } from '../lib/api';
import { useUIStore } from '../store/useUIStore';

function ProjectsPage() {
  const [experiments, setExperiments] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const setActivePage = useUIStore((s) => s.setActivePage);

  useEffect(() => {
    api.experiments.list().then(r => setExperiments(r.experiments)).catch(() => {});
    api.models.list().then(r => setModels(r.models)).catch(() => {});
  }, []);

  const successful = experiments.filter(e => e.status === 'success').length;
  const projects = [
    { name: 'Customer Churn', models: 5, status: 'Production', updated: '2 hours ago' },
    { name: 'Fraud Detection', models: 8, status: 'Staging', updated: '1 day ago' },
    { name: 'Price Optimization', models: 3, status: 'Development', updated: '3 days ago' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6 p-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Experiments', value: experiments.length, icon: FlaskConical },
          { label: 'Successful runs', value: successful, icon: FolderOpen },
          { label: 'Trained models', value: models.length, icon: Database },
          { label: 'Deployments', value: 0, icon: Rocket },
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
            <p className="text-sm text-slate-400">Workspace organization</p>
            <h2 className="text-2xl font-semibold text-white">Active projects</h2>
          </div>
          <button
            onClick={() => setActivePage('Datasets')}
            className="rounded-2xl bg-primary/20 px-4 py-2 text-sm font-medium text-white hover:bg-primary/30 transition-colors"
          >
            New project
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div key={project.name} className="rounded-[28px] border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <p className="font-medium text-white">{project.name}</p>
                  <p className="text-sm text-slate-400">{project.models} models</p>
                </div>
                <button className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:text-white">
                  <Star className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">{project.status}</div>
                <span className="text-sm text-slate-500">{project.updated}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Quick actions</p>
            <h3 className="text-lg font-semibold text-white">Get started</h3>
          </div>
          <FolderOpen className="h-5 w-5 text-accent" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => setActivePage('Datasets')}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Upload a dataset
          </button>
          <button
            onClick={() => setActivePage('Training')}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Start a new training run
          </button>
          <button
            onClick={() => setActivePage('Experiments')}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            View recent experiments
          </button>
          <button
            onClick={() => setActivePage('Dashboard')}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Go to dashboard
          </button>
        </div>
      </section>
    </motion.div>
  );
}

export default ProjectsPage;
