import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, AlertCircle, Cpu, HardDrive, Network } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { api } from '../lib/api';
import { staggerContainer, staggerItem } from '../lib/animations';

const chartData = [
  { time: '10:00', cpu: 32, memory: 45, latency: 28 },
  { time: '10:15', cpu: 38, memory: 48, latency: 32 },
  { time: '10:30', cpu: 42, memory: 52, latency: 35 },
  { time: '10:45', cpu: 48, memory: 58, latency: 42 },
  { time: '11:00', cpu: 54, memory: 65, latency: 48 },
  { time: '11:15', cpu: 58, memory: 72, latency: 54 },
];

function MonitoringPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.monitoring.metrics().then(setMetrics).catch(() => {});
    api.monitoring.stats().then(setStats).catch(() => {});
  }, []);

  const m = metrics || {};
  const s = stats || {};

  const cards = [
    { label: 'CPU Usage', value: m.cpu ? `${m.cpu.value}%` : '—', icon: Cpu, detail: m.cpu?.detail },
    { label: 'Memory', value: m.memory ? `${m.memory.value}%` : '—', icon: HardDrive, detail: m.memory?.detail },
    { label: 'Network I/O', value: '—', icon: Network, detail: 'N/A' },
    { label: 'P95 Latency', value: s.avgLatencyMs ? `${s.avgLatencyMs}ms` : '—', icon: Activity, detail: 'Avg inference' },
  ];

  const alertItems = [
    { alert: 'High memory usage', level: 'warning', time: '5 min ago' },
    { alert: 'CPU spike detected', level: 'info', time: '12 min ago' },
    { alert: 'Latency increase', level: 'warning', time: '18 min ago' },
  ];

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.section variants={staggerItem} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Real-time dashboard</p>
            <h2 className="text-2xl font-semibold text-white">System monitoring</h2>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            {metrics ? 'Live' : 'Loading'}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-xs text-slate-500">{metric.detail}</span>
                </div>
                <p className="text-sm text-slate-400">{metric.label}</p>
                <p className="mt-1 text-2xl font-semibold text-white">{metric.value}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs text-slate-500">Models trained</p>
            <p className="text-lg font-semibold text-white">{s.modelsTrained ?? '—'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs text-slate-500">Deployments</p>
            <p className="text-lg font-semibold text-white">{s.activeDeployments ?? '—'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs text-slate-500">Requests today</p>
            <p className="text-lg font-semibold text-white">{s.inferenceRequestsToday ?? '—'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs text-slate-500">Avg latency</p>
            <p className="text-lg font-semibold text-white">{s.avgLatencyMs ? `${s.avgLatencyMs}ms` : '—'}</p>
          </div>
        </div>
      </motion.section>

      <motion.section variants={staggerItem} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Performance trends</p>
              <h3 className="text-lg font-semibold text-white">Last hour</h3>
            </div>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="time" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Line type="monotone" dataKey="cpu" stroke="#6366F1" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="memory" stroke="#06B6D4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Alerts</p>
              <h3 className="text-lg font-semibold text-white">Active incidents</h3>
            </div>
            <AlertCircle className="h-5 w-5 text-warning" />
          </div>
          <div className="space-y-3">
            {alertItems.map((item) => (
              <div key={item.alert} className={`rounded-2xl px-4 py-3 text-sm ${
                item.level === 'warning'
                  ? 'border border-warning/20 bg-warning/10 text-warning'
                  : 'border border-primary/20 bg-primary/10 text-primary'
              }`}>
                <div className="flex items-center justify-between">
                  <span>{item.alert}</span>
                  <span className="text-xs text-slate-500">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}

export default MonitoringPage;