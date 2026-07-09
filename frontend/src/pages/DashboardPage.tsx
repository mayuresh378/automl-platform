import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, ArrowUpRight, Sparkles, BrainCircuit, Clock3 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { api } from '../lib/api';

const trendData = [
  { month: 'Jan', value: 48 }, { month: 'Feb', value: 62 },
  { month: 'Mar', value: 59 }, { month: 'Apr', value: 74 },
  { month: 'May', value: 82 }, { month: 'Jun', value: 91 },
];

function DashboardPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [experiments, setExperiments] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);

  useEffect(() => {
    api.datasets.list().then(r => setDatasets(r.datasets)).catch(() => {});
    api.experiments.list().then(r => setExperiments(r.experiments)).catch(() => {});
    api.models.list().then(r => setModels(r.models)).catch(() => {});
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
        <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8 shadow-glow">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="mb-2 text-sm font-medium uppercase tracking-[0.28em] text-slate-400">Operations Center</p>
              <h2 className="text-3xl font-semibold text-white">Your AI platform is ready for production workloads.</h2>
            </div>
            <button className="rounded-2xl border border-primary/30 bg-primary/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/30">
              New experiment
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: 'Datasets', value: String(datasets.length), trend: `${datasets.length > 0 ? '+' : ''}${datasets.length}` },
              { label: 'Models', value: String(models.length), trend: `${models.length > 0 ? '+' : ''}${models.length}` },
              { label: 'Experiments', value: String(experiments.length), trend: `${experiments.length > 0 ? '+' : ''}${experiments.length}` },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-white/10 bg-[#121623]/70 p-4">
                <p className="text-sm text-slate-400">{item.label}</p>
                <div className="mt-2 flex items-end justify-between">
                  <span className="text-2xl font-semibold text-white">{item.value}</span>
                  <span className="text-sm text-emerald-400">{item.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[#121623]/80 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">AI Assistant</p>
              <h3 className="text-lg font-semibold text-white">Suggested next action</h3>
            </div>
            <Sparkles className="h-5 w-5 text-accent" />
          </div>
          <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 to-accent/10 p-4">
            <p className="text-sm text-slate-300">
              {datasets.length === 0
                ? 'Upload a dataset to get started with AutoML training.'
                : experiments.length === 0
                  ? 'Start a training experiment on your datasets.'
                  : 'Check your latest experiment results in the training page.'}
            </p>
            <button className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20">
              Get started <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Performance</p>
              <h3 className="text-lg font-semibold text-white">Model accuracy trend</h3>
            </div>
            <div className="rounded-2xl bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">+14.8%</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#818CF8" fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Resource health</p>
              <h3 className="text-lg font-semibold text-white">Infrastructure utilization</h3>
            </div>
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-4">
            {[
              { label: 'GPU', value: '78%', color: 'from-primary to-accent' },
              { label: 'CPU', value: '63%', color: 'from-accent to-cyan-400' },
              { label: 'Storage', value: '41%', color: 'from-fuchsia-500 to-primary' },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className={`h-2 rounded-full bg-gradient-to-r ${item.color}`} style={{ width: item.value }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Recent activity</p>
              <h3 className="text-lg font-semibold text-white">Training queue</h3>
            </div>
            <Clock3 className="h-5 w-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            {experiments.slice(0, 3).map((exp: any) => (
              <div key={exp.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${exp.status === 'success' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className="text-sm text-slate-300">{exp.model} &mdash; {exp.accuracy} accuracy</span>
                </div>
                <span className="text-sm text-slate-500">{exp.runAt}</span>
              </div>
            ))}
            {experiments.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No experiments run yet</p>
            )}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Favorites</p>
              <h3 className="text-lg font-semibold text-white">Pinned models</h3>
            </div>
            <BrainCircuit className="h-5 w-5 text-accent" />
          </div>
          <div className="space-y-3">
            {models.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Train a model to see it here</p>
            ) : models.slice(0, 2).map((m: any) => (
              <div key={m.name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{m.name}</p>
                    <p className="text-sm text-slate-400">{m.size_kb} KB</p>
                  </div>
                  <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">Ready</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}

export default DashboardPage;
