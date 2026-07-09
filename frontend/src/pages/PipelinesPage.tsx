import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Play, Save, Zap } from 'lucide-react';
import { api } from '../lib/api';
import { useUIStore } from '../store/useUIStore';

function PipelinesPage() {
  const [models, setModels] = useState<any[]>([]);
  const setActivePage = useUIStore((s) => s.setActivePage);

  useEffect(() => {
    api.models.list().then(r => setModels(r.models)).catch(() => {});
  }, []);

  const pipelines = [
    { name: 'ETL Pipeline', steps: 5, status: 'Active', lastRun: '2 hours ago', executions: '847' },
    { name: 'Feature Pipeline', steps: 8, status: 'Active', lastRun: '1 hour ago', executions: '612' },
    { name: 'Training Pipeline', steps: 12, status: 'Active', lastRun: '3 hours ago', executions: '34' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6 p-6">
      <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Workflow automation</p>
            <h2 className="text-2xl font-semibold text-white">Data & training pipelines</h2>
          </div>
          <button
            onClick={() => setActivePage('Datasets')}
            className="rounded-2xl bg-primary/20 px-4 py-2 text-sm font-medium text-white hover:bg-primary/30 transition-colors"
          >
            Create pipeline
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pipelines.map((pipeline) => (
            <div key={pipeline.name} className="rounded-[28px] border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <p className="font-medium text-white">{pipeline.name}</p>
                  <p className="text-sm text-slate-400">{pipeline.steps} steps</p>
                </div>
                <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">{pipeline.status}</div>
              </div>
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Last run</span>
                  <span>{pipeline.lastRun}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total executions</span>
                  <span className="text-white">{pipeline.executions}</span>
                </div>
              </div>
              <button
                onClick={() => setActivePage('Experiments')}
                className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                View runs
              </button>
            </div>
          ))}
        </div>
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
            <button
              onClick={() => setActivePage('Training')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              <Play className="h-4 w-4" />
              Run training
            </button>
            <button
              onClick={() => setActivePage('Datasets')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              <Save className="h-4 w-4" />
              Add data source
            </button>
            <button
              onClick={() => setActivePage('Experiments')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              <GitBranch className="h-4 w-4" />
              View history
            </button>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

export default PipelinesPage;
