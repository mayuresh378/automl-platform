import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { GitCompare, Trophy, TrendingUp, Clock, Cpu, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { staggerContainer, staggerItem } from '../lib/animations';

function ModelComparisonPage() {
  const [experiments, setExperiments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.experiments.list().then(r => setExperiments(r.experiments || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>;

  const modelData = experiments
    .filter(e => e.cv_score != null)
    .map(e => ({
      name: e.model || 'Unknown',
      fullName: e.name || e.id?.slice(0, 8),
      score: +(e.cv_score * 100).toFixed(1),
      time: e.training_time ? +(e.training_time).toFixed(2) : 0,
      dataset: e.dataset || '-',
      status: e.status || 'success',
    }))
    .sort((a, b) => b.score - a.score);

  const best = modelData[0];
  const avgScore = modelData.length ? (modelData.reduce((s, m) => s + m.score, 0) / modelData.length).toFixed(1) : '0';

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 p-6">
      <motion.div variants={staggerItem}>
        <p className="text-sm text-slate-400">Model analysis</p>
        <h1 className="text-2xl font-semibold text-white flex items-center gap-3">
          <GitCompare className="h-6 w-6 text-accent" />
          Model Comparison
        </h1>
      </motion.div>

      {modelData.length > 0 && (
        <motion.div variants={staggerItem} className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="card-hover rounded-[28px] border border-emerald-500/20 bg-emerald-500/5 p-5">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-emerald-400" />
              <span className="text-[10px] uppercase tracking-wider text-emerald-400/70">Best model</span>
            </div>
            <p className="text-lg font-semibold text-white">{best.name}</p>
            <p className="text-xs text-emerald-400">{best.score}%</p>
          </div>
          <div className="card-hover rounded-[28px] border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-accent" />
              <span className="text-[10px] uppercase tracking-wider text-slate-500">Avg score</span>
            </div>
            <p className="text-lg font-semibold text-white">{avgScore}%</p>
          </div>
          <div className="card-hover rounded-[28px] border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="h-4 w-4 text-amber-400" />
              <span className="text-[10px] uppercase tracking-wider text-slate-500">Models trained</span>
            </div>
            <p className="text-lg font-semibold text-white">{modelData.length}</p>
          </div>
          <div className="card-hover rounded-[28px] border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-rose-400" />
              <span className="text-[10px] uppercase tracking-wider text-slate-500">Fastest</span>
            </div>
            <p className="text-lg font-semibold text-white">{modelData.filter(m => m.time > 0).sort((a, b) => a.time - b.time)[0]?.time || '?'}s</p>
          </div>
        </motion.div>
      )}

      <motion.div variants={staggerItem} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-white">Performance leaderboard</h3>
        </div>
        <div className="space-y-2">
          {modelData.slice(0, 20).map((m, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition">
              <span className={`w-6 text-center text-sm font-bold ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-700' : 'text-slate-600'}`}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{m.name}</span>
                  <span className="text-[10px] text-slate-500 truncate">{m.fullName}</span>
                </div>
                <div className="text-[10px] text-slate-500">Dataset: {m.dataset}</div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-xs text-slate-500">{m.time > 0 ? `${m.time}s` : '-'}</span>
                <div className="w-20 h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-accent to-emerald-400" style={{ width: `${m.score}%` }} />
                </div>
                <span className="w-12 text-right text-sm font-mono font-semibold text-white">{m.score}%</span>
              </div>
            </div>
          ))}
          {modelData.length === 0 && <p className="text-sm text-slate-500 text-center py-8">No experiments yet.</p>}
        </div>
      </motion.div>

      {modelData.length > 1 && (
        <motion.div variants={staggerItem} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Score comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={modelData.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="score" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </motion.div>
  );
}

export default ModelComparisonPage;