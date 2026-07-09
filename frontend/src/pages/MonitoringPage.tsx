import { motion } from 'framer-motion';
import { Activity, TrendingUp, AlertCircle, Cpu, HardDrive, Network } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const monitoringData = [
  { time: '10:00', cpu: 32, memory: 45, latency: 28 },
  { time: '10:15', cpu: 38, memory: 48, latency: 32 },
  { time: '10:30', cpu: 42, memory: 52, latency: 35 },
  { time: '10:45', cpu: 48, memory: 58, latency: 42 },
  { time: '11:00', cpu: 54, memory: 65, latency: 48 },
  { time: '11:15', cpu: 58, memory: 72, latency: 54 },
];

function MonitoringPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Real-time dashboard</p>
            <h2 className="text-2xl font-semibold text-white">System monitoring</h2>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            Healthy
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'CPU Usage', value: '58%', icon: Cpu, trend: '↑ 8%' },
            { label: 'Memory', value: '72%', icon: HardDrive, trend: '↑ 5%' },
            { label: 'Network I/O', value: '284 Mbps', icon: Network, trend: '↓ 12%' },
            { label: 'P95 Latency', value: '54ms', icon: Activity, trend: '↑ 3%' },
          ].map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-sm text-slate-500">{metric.trend}</span>
                </div>
                <p className="text-sm text-slate-400">{metric.label}</p>
                <p className="mt-1 text-2xl font-semibold text-white">{metric.value}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Performance trends</p>
              <h3 className="text-lg font-semibold text-white">Last hour</h3>
            </div>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monitoringData}>
                <XAxis dataKey="time" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Line type="monotone" dataKey="cpu" stroke="#6366F1" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="memory" stroke="#06B6D4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Alerts</p>
              <h3 className="text-lg font-semibold text-white">Active incidents</h3>
            </div>
            <AlertCircle className="h-5 w-5 text-warning" />
          </div>
          <div className="space-y-3">
            {[
              { alert: 'High memory usage', level: 'warning', time: '5 min ago' },
              { alert: 'CPU spike detected', level: 'info', time: '12 min ago' },
              { alert: 'Latency increase', level: 'warning', time: '18 min ago' },
            ].map((item) => (
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
      </section>
    </motion.div>
  );
}

export default MonitoringPage;
