import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, PlayCircle, TimerReset, Cpu, HardDrive, Zap } from 'lucide-react';
import { api } from '../lib/api';
import { useNotificationStore } from '../store/useNotificationStore';

function TrainingPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [experiments, setExperiments] = useState<any[]>([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [targetColumn, setTargetColumn] = useState('');
  const [training, setTraining] = useState(false);
  const [result, setResult] = useState<any>(null);
  const notify = useNotificationStore((s) => s.add);

  useEffect(() => {
    api.datasets.list().then(r => setDatasets(r.datasets)).catch(() => {});
    api.experiments.list().then(r => setExperiments(r.experiments)).catch(() => {});
  }, []);

  const handleTrain = async () => {
    if (!selectedDataset || !targetColumn) return alert('Select a dataset and target column');
    setTraining(true);
    setResult(null);
    try {
      const res: any = await api.training.start(selectedDataset, targetColumn);
      setResult(res);
      api.experiments.list().then(r => setExperiments(r.experiments)).catch(() => {});
      notify({ title: 'Training complete', message: `${selectedDataset} finished with score ${res.training_summary?.cv_score ?? 'N/A'}`, type: 'success' });
    } catch (err: any) {
      notify({ title: 'Training failed', message: err.message, type: 'error' });
    }
    setTraining(false);
  };

  const cols = datasets.find(d => d.name === selectedDataset)?.columns || [];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Train models</p>
              <h2 className="text-2xl font-semibold text-white">Launch production-grade experiments</h2>
            </div>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-primary/10 to-accent/10 p-5 space-y-4">
            <div>
              <label className="text-sm text-slate-400 block mb-1">Dataset</label>
              <select className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none" value={selectedDataset} onChange={e => { setSelectedDataset(e.target.value); setTargetColumn(''); }}>
                <option value="">Select a dataset...</option>
                {datasets.map((d: any) => <option key={d.name} value={d.name}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">Target column</label>
              <select className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none" value={targetColumn} onChange={e => setTargetColumn(e.target.value)}>
                <option value="">Select target...</option>
                {cols.map((c: string) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button onClick={handleTrain} disabled={training} className="w-full rounded-2xl bg-primary/30 px-4 py-3 font-medium text-white hover:bg-primary/40 disabled:opacity-50">
              {training ? 'Training...' : 'Start AutoML training'}
            </button>
            {result && (
              <div className="mt-4 rounded-2xl bg-emerald-500/10 p-4 text-sm text-emerald-300">
                Best model: <strong>{result.training_summary?.best_model}</strong> &middot;
                Score: <strong>{result.training_summary?.cv_score ?? 'N/A'}</strong>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">History</p>
              <h3 className="text-lg font-semibold text-white">Recent experiments</h3>
            </div>
            <PlayCircle className="h-5 w-5 text-accent" />
          </div>
          <div className="space-y-3">
            {experiments.length === 0 && <p className="text-sm text-slate-500 text-center py-8">No experiments yet</p>}
            {experiments.map((exp: any) => (
              <div key={exp.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-sm font-medium text-white">{exp.model}</p>
                <p className="text-xs text-slate-400">Score: {exp.cv_score ?? 'N/A'} &middot; {exp.runAt ? new Date(exp.runAt).toLocaleDateString() : ''}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Monitoring</p>
              <h3 className="text-lg font-semibold text-white">Live metrics</h3>
            </div>
            <Cpu className="h-5 w-5 text-primary" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'GPU', value: '82%', icon: Zap },
              { label: 'CPU', value: '64%', icon: Cpu },
              { label: 'Memory', value: '3.1 GB', icon: HardDrive },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 flex items-center gap-2 text-slate-400"><Icon className="h-4 w-4" />{item.label}</div>
                  <p className="text-xl font-semibold text-white">{item.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </motion.div>
  );
}

export default TrainingPage;
