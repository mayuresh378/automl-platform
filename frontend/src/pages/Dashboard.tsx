import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { TrendingUp, Clock, BarChart3, Layers } from 'lucide-react';
import { staggerContainer, staggerItem } from '../lib/animations';
import { NeuralPulse } from '../components/NeuralPulse';
import { QuickActions } from '../components/QuickActions';
import { LiveStatStrip } from '../components/LiveStatStrip';
import { MetricGrid } from '../components/MetricGrid';
import { TrainingQueue } from '../components/TrainingQueue';
import { AIAssistantPanel } from '../components/AIAssistantPanel';
import { ExperimentsTable } from '../components/ExperimentsTable';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { api } from '../lib/api';
import { useDatasets, useModels, useProjects } from '../hooks/useApi';

function DashboardCharts() {
  const [experiments, setExperiments] = useState<any[]>([]);
  useEffect(() => {
    api.experiments.list().then(r => setExperiments(r.experiments || [])).catch(() => {});
  }, []);

  if (experiments.length === 0) return null;

  const trendData = [...experiments].reverse().slice(0, 20).map((e, i) => ({
    name: e.name?.slice(0, 12) || `Exp ${i + 1}`,
    score: e.cv_score ? +(e.cv_score * 100).toFixed(1) : 0,
    time: e.training_time ? +(e.training_time * 1000).toFixed(0) : 0,
  }));

  const modelStats: Record<string, { count: number; avgScore: number }> = {};
  experiments.forEach((e: any) => {
    const m = e.model || 'unknown';
    if (!modelStats[m]) modelStats[m] = { count: 0, avgScore: 0 };
    modelStats[m].count++;
    modelStats[m].avgScore += e.cv_score || 0;
  });
  Object.values(modelStats).forEach(s => s.avgScore = +(s.avgScore / s.count * 100).toFixed(1));

  const modelData = Object.entries(modelStats).map(([name, stats]) => ({ name: name.slice(0, 10), ...stats }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="card-hover rounded-[28px] border border-white/10 bg-[#111827]/80 p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Accuracy trends</h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={2} dot={{ r: 3, fill: '#6366F1' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="card-hover rounded-[28px] border border-white/10 bg-[#111827]/80 p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold text-white">Model performance</h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={modelData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="avgScore" fill="#06B6D4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StorageUsage() {
  const { data: datasets = [] } = useDatasets();
  const { data: models = [] } = useModels();
  const { data: projects = [] } = useProjects();

  const totalSize = datasets.reduce((s: number, d: any) => s + (d.size_kb || 0), 0);
  const totalRows = datasets.reduce((s: number, d: any) => s + (d.rows || 0), 0);

  const items = [
    { label: 'Datasets', value: datasets.length, sub: `${(totalSize / 1024).toFixed(1)} MB`, color: 'bg-accent' },
    { label: 'Models', value: models.length, sub: `${models.length} trained`, color: 'bg-emerald-400' },
    { label: 'Projects', value: projects.length, sub: 'workspaces', color: 'bg-amber-400' },
    { label: 'Rows processed', value: totalRows.toLocaleString(), sub: 'total', color: 'bg-rose-400' },
  ];

  return (
    <div className="card-hover rounded-[28px] border border-white/10 bg-[#111827]/80 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="h-4 w-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">Usage overview</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map(item => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-slate-400">{item.label}</p>
            <p className="text-lg font-semibold text-white">{item.value}</p>
            <p className="text-[10px] text-slate-500">{item.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Dashboard() {
  return (
    <div className="flex-1 min-w-0">
      <div className="px-4 md:px-8 pt-6 text-xs text-zinc-600">
        Workspace <span className="mx-1.5 text-zinc-700">/</span>
        <span className="text-zinc-300">Dashboard</span>
      </div>

      <section className="relative px-4 md:px-8 pt-4 pb-10 overflow-hidden">
        <div className="pointer-events-none absolute -top-24 left-1/3 h-[420px] w-[420px] rounded-full opacity-20 blur-[100px] animate-drift" style={{ background: 'radial-gradient(circle, #6366F1 0%, transparent 70%)' }} />
        <div className="pointer-events-none absolute top-40 right-1/4 h-[300px] w-[300px] rounded-full opacity-10 blur-[80px] animate-drift" style={{ background: 'radial-gradient(circle, #06B6D4 0%, transparent 70%)', animationDelay: '-4s' }} />
        <div className="pointer-events-none absolute bottom-0 left-1/6 h-[200px] w-[200px] rounded-full opacity-10 blur-[60px] animate-drift" style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)', animationDelay: '-8s' }} />
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="relative grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
          <motion.div variants={staggerItem}>
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/[0.03] px-3 py-1 text-[11px] text-zinc-400 mb-4">
              <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} className="h-1.5 w-1.5 rounded-full bg-success" />
              All systems operational
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="text-3xl md:text-4xl font-semibold tracking-tight text-gradient leading-[1.15] mb-3">
              Every model you train,<br />watched in real time.
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="text-[15px] text-zinc-400 max-w-md mb-6 leading-relaxed">
              Upload a dataset, let AutoML Studio race the field, and ship a prediction endpoint — without leaving this screen.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="mb-8"><QuickActions /></motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}><LiveStatStrip /></motion.div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }} whileHover={{ y: -2, boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 12px 40px rgba(99, 102, 241, 0.15)' }} className="relative rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-4 h-[340px] noise-overlay">
            <NeuralPulse />
          </motion.div>
        </motion.div>
      </section>

      <section className="px-4 md:px-8 pb-8"><MetricGrid /></section>

      <section className="px-4 md:px-8 pb-8 grid lg:grid-cols-[1.4fr_1fr] gap-4">
        <TrainingQueue />
        <AIAssistantPanel />
      </section>

      <section className="px-4 md:px-8 pb-8"><DashboardCharts /></section>

      <section className="px-4 md:px-8 pb-8 grid lg:grid-cols-[1.5fr_1fr] gap-4 items-start">
        <ExperimentsTable />
        <div className="space-y-4">
          <ActivityTimeline />
          <StorageUsage />
        </div>
      </section>
    </div>
  );
}