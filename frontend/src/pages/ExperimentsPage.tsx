import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, ChevronDown, ChevronUp, CheckCircle2, XCircle, TrendingUp, Clock, Award, BarChart3 } from 'lucide-react';
import { api } from '../lib/api';

function ExperimentsPage() {
  const [experiments, setExperiments] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    api.experiments.list().then(r => setExperiments(r.experiments)).catch(() => {});
  }, []);

  const successful = experiments.filter(e => e.status === 'success');
  const failed = experiments.filter(e => e.status !== 'success');
  const best = successful.length > 0 ? successful.reduce((a, b) => (a.cv_score || 0) > (b.cv_score || 0) ? a : b) : null;
  const avgScore = successful.length > 0 ? (successful.reduce((s, e) => s + (e.cv_score || 0), 0) / successful.length).toFixed(4) : '—';
  const totalTime = experiments.reduce((s, e) => s + (e.training_time || 0), 0);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total runs', value: experiments.length, icon: FlaskConical },
          { label: 'Successful', value: successful.length, icon: CheckCircle2 },
          { label: 'Best score', value: best ? best.cv_score : '—', icon: Award },
          { label: 'Avg score', value: avgScore, icon: TrendingUp },
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
            <p className="text-sm text-slate-400">Experiment tracking</p>
            <h2 className="text-2xl font-semibold text-white">Training runs & results</h2>
          </div>
          <div className="rounded-2xl bg-white/10 px-3 py-1 text-sm text-slate-300">{experiments.length} runs</div>
        </div>

        {best && (
          <div className="mb-6 rounded-3xl border border-accent/20 bg-accent/5 p-4 flex items-center gap-4">
            <Award className="h-8 w-8 text-accent shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Best run: {best.name}</p>
              <p className="text-xs text-slate-400">Score {best.cv_score} on {best.dataset} using {best.model} ({best.training_time}s)</p>
            </div>
            <TrendingUp className="h-5 w-5 text-accent" />
          </div>
        )}

        {experiments.length === 0 && (
          <div className="py-16 text-center text-sm text-slate-500">No experiments yet. Start training to see results.</div>
        )}

        <div className="space-y-3">
          {experiments.map((exp: any) => (
            <div key={exp.id} className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
              <button className="w-full flex items-center justify-between px-5 py-4 text-left" onClick={() => setExpanded(expanded === exp.id ? null : exp.id)}>
                <div className="flex items-center gap-4">
                  <FlaskConical className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white">{exp.name}</p>
                    <p className="text-xs text-slate-400">{exp.dataset} &middot; target: {exp.target}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{exp.cv_score}</p>
                    <p className="text-xs text-slate-400">CV score</p>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-xs ${exp.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                    {exp.status}
                  </div>
                  {expanded === exp.id ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </div>
              </button>

              <AnimatePresence>
                {expanded === exp.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/10 px-5 py-4">
                    <div className="grid gap-4 md:grid-cols-4 mb-4">
                      <div className="rounded-2xl border border-white/10 bg-[#111827]/70 p-3">
                        <p className="text-xs text-slate-400">Model</p>
                        <p className="text-sm font-medium text-white">{exp.model}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-[#111827]/70 p-3">
                        <p className="text-xs text-slate-400">Task type</p>
                        <p className="text-sm font-medium text-white">{exp.task_type || 'classification'}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-[#111827]/70 p-3">
                        <p className="text-xs text-slate-400">Training time</p>
                        <p className="text-sm font-medium text-white">{exp.training_time}s</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-[#111827]/70 p-3">
                        <p className="text-xs text-slate-400">Dataset</p>
                        <p className="text-sm font-medium text-white truncate">{exp.dataset}</p>
                      </div>
                    </div>

                    {exp.metrics && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-slate-400 mb-2">Metrics</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(exp.metrics).filter(([k]) => k !== 'confusion_matrix').map(([key, val]) => (
                            <span key={key} className="rounded-xl bg-primary/10 px-3 py-1 text-xs text-white">
                              {key}: {typeof val === 'number' ? val.toFixed(4) : String(val)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-[#111827]/70 p-3">
                        <p className="text-xs text-slate-400 flex items-center gap-1"><Clock className="h-3 w-3" /> Total time</p>
                        <p className="text-sm font-medium text-white">{exp.total_time || exp.training_time}s</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-[#111827]/70 p-3">
                        <p className="text-xs text-slate-400 flex items-center gap-1"><BarChart3 className="h-3 w-3" /> Target column</p>
                        <p className="text-sm font-medium text-white">{exp.target}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

export default ExperimentsPage;
