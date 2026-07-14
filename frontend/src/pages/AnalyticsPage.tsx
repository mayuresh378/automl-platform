import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, BarChart3, Clock, Database, Boxes, FlaskConical, Gauge, Loader2 } from 'lucide-react';
import { BASE } from '../lib/api';
import { staggerContainer, staggerItem } from '../lib/animations';

const COLORS = ['#6366F1', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/analytics`).then(r => r.json()).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 p-6">
      <motion.div variants={staggerItem}>
        <p className="text-sm text-slate-400">Analytics</p>
        <h1 className="text-2xl font-semibold text-white flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-accent" />
          Analytics Dashboard
        </h1>
      </motion.div>

      {data && (
        <>
          <motion.div variants={staggerItem} className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Experiments', value: data.total_experiments, icon: FlaskConical, color: 'text-accent' },
              { label: 'Models', value: data.total_models, icon: Boxes, color: 'text-emerald-400' },
              { label: 'Datasets', value: data.total_datasets, icon: Database, color: 'text-amber-400' },
              { label: 'Training hours', value: data.total_training_hours?.toFixed(1), icon: Clock, color: 'text-rose-400' },
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

          <div className="grid gap-6 xl:grid-cols-2">
            {data.training_trends?.length > 0 && (
              <motion.div variants={staggerItem} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  <h3 className="text-lg font-semibold text-white">Training trends</h3>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.training_trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {data.model_distribution?.length > 0 && (
              <motion.div variants={staggerItem} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Gauge className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-lg font-semibold text-white">Model distribution</h3>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={data.model_distribution} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {data.model_distribution.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </div>

          {data.accuracy_trends?.length > 0 && (
            <motion.div variants={staggerItem} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">Accuracy trends</h3>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.accuracy_trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="score" stroke="#06B6D4" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}

export default AnalyticsPage;