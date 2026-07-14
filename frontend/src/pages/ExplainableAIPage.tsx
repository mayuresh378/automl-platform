import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BrainCircuit, TrendingUp, Gauge, Lightbulb, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import { staggerContainer, staggerItem } from '../lib/animations';
import { Button } from '../components/Button';

function ExplainableAIPage() {
  const [experiments, setExperiments] = useState<any[]>([]);
  const [selectedExp, setSelectedExp] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.experiments.list().then(r => setExperiments(r.experiments || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const selected = experiments.find(e => e.id === selectedExp);
  const features = selected?.feature_importance || [];
  const featureData = Array.isArray(features)
    ? features.slice(0, 15).map((f: any) => ({
        name: typeof f === 'string' ? f : f.feature || f.name || '?',
        importance: typeof f === 'object' ? (f.importance || f.score || 0) : 0,
      })).sort((a, b) => b.importance - a.importance)
    : [];

  const confidence = selected?.cv_score ? +(selected.cv_score * 100).toFixed(1) : 0;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 p-6">
      <motion.div variants={staggerItem} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-400">Model interpretability</p>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-3">
            <BrainCircuit className="h-6 w-6 text-accent" />
            Explainable AI
          </h1>
        </div>
        <select value={selectedExp} onChange={e => setSelectedExp(e.target.value)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-accent/40">
          <option value="">Select an experiment...</option>
          {experiments.map(e => (
            <option key={e.id} value={e.id}>{e.name || e.model || e.id?.slice(0, 8)}</option>
          ))}
        </select>
      </motion.div>

      {!selectedExp && (
        <motion.div variants={staggerItem} className="flex flex-col items-center justify-center py-20 text-center">
          <BrainCircuit className="h-16 w-16 text-accent/30 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Select an experiment</h2>
          <p className="text-sm text-slate-400 max-w-md">Analyze feature importance, model confidence, and prediction explanations.</p>
        </motion.div>
      )}

      {selected && (
        <>
          <motion.div variants={staggerItem} className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <div className="card-hover rounded-[28px] border border-white/10 bg-white/5 p-5">
              <span className="text-[10px] uppercase tracking-wider text-slate-500">Model</span>
              <p className="text-lg font-semibold text-white">{selected.model || 'Unknown'}</p>
            </div>
            <div className="card-hover rounded-[28px] border border-white/10 bg-white/5 p-5">
              <span className="text-[10px] uppercase tracking-wider text-slate-500">Dataset</span>
              <p className="text-lg font-semibold text-white truncate">{selected.dataset || '-'}</p>
            </div>
            <div className="card-hover rounded-[28px] border border-white/10 bg-white/5 p-5">
              <span className="text-[10px] uppercase tracking-wider text-slate-500">Task</span>
              <p className="text-lg font-semibold text-white">{selected.task_type || '-'}</p>
            </div>
            <div className="card-hover rounded-[28px] border border-accent/20 bg-accent/5 p-5">
              <div className="flex items-center gap-2 mb-1">
                <Gauge className="h-4 w-4 text-accent" />
                <span className="text-[10px] uppercase tracking-wider text-accent/70">Confidence</span>
              </div>
              <p className="text-lg font-semibold text-white">{confidence}%</p>
              <div className="mt-2 h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-accent to-emerald-400 transition-all" style={{ width: `${confidence}%` }} />
              </div>
            </div>
          </motion.div>

          <div className="grid gap-6 xl:grid-cols-2">
            <motion.div variants={staggerItem} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <h3 className="text-lg font-semibold text-white">Feature Importance</h3>
              </div>
              {featureData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={featureData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="importance" fill="#10B981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="py-8 text-center text-sm text-slate-500">
                  <Lightbulb className="h-8 w-8 text-amber-400/50 mx-auto mb-2" />
                  <p>No feature importance data available for this experiment.</p>
                  <p className="text-xs text-slate-600 mt-1">Feature importance is captured during training for tree-based models.</p>
                </div>
              )}
            </motion.div>

            <motion.div variants={staggerItem} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-semibold text-white">Prediction Explanation</h3>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-slate-400">Analyze why a model makes its predictions by examining the top contributing features.</p>
                {featureData.slice(0, 5).map((f, i) => (
                  <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">{f.name}</span>
                      <span className={`text-xs font-mono ${f.importance > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {f.importance > 0 ? '+' : ''}{(f.importance * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className={`h-full rounded-full ${f.importance > 0 ? 'bg-emerald-400' : 'bg-red-400'}`} style={{ width: `${Math.abs(f.importance) * 100}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {f.importance > 0 ? `Increases prediction confidence by ${(f.importance * 100).toFixed(1)}%` : `Decreases prediction confidence by ${(Math.abs(f.importance) * 100).toFixed(1)}%`}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div variants={staggerItem} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Gauge className="h-5 w-5 text-accent" />
              <h3 className="text-lg font-semibold text-white">Model Metrics</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Accuracy', value: selected.cv_score ? `${(selected.cv_score * 100).toFixed(1)}%` : '-' },
                { label: 'Training time', value: selected.training_time ? `${selected.training_time.toFixed(2)}s` : '-' },
                { label: 'Status', value: selected.status || '-' },
                { label: 'Confidence', value: `${confidence}%` },
              ].map(m => (
                <div key={m.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-xs text-slate-400 mb-1">{m.label}</p>
                  <p className="text-sm font-semibold text-white">{m.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

export default ExplainableAIPage;