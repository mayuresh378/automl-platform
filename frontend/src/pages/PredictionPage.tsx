import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, Copy, TrendingUp } from 'lucide-react';
import { api } from '../lib/api';

function PredictionPage() {
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [payload, setPayload] = useState('{"age": 42, "income": 89100}');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.models.list().then(r => setModels(r.models)).catch(() => {});
  }, []);

  const handlePredict = async () => {
    if (!selectedModel) return alert('Select a model first');
    setLoading(true);
    setResult(null);
    try {
      const res = await api.predictions.run(selectedModel, JSON.parse(payload));
      setResult(res);
    } catch (err: any) {
      alert(err.message);
    }
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Inference</p>
              <h2 className="text-2xl font-semibold text-white">Serve predictions with explainability</h2>
            </div>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-primary/10 to-accent/10 p-5 space-y-4">
            <div>
              <label className="text-sm text-slate-400 block mb-1">Model</label>
              <select className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none" value={selectedModel} onChange={e => setSelectedModel(e.target.value)}>
                <option value="">Select a model...</option>
                {models.map((m: any) => <option key={m.name} value={m.name}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">Input payload (JSON)</label>
              <textarea className="min-h-32 w-full rounded-2xl border border-white/10 bg-[#111827]/70 p-4 text-sm text-slate-300 outline-none font-mono"
                value={payload} onChange={e => setPayload(e.target.value)} />
            </div>
            <button onClick={handlePredict} disabled={loading} className="btn-press w-full rounded-2xl bg-primary/30 px-4 py-3 font-medium text-white hover:bg-primary/40 disabled:opacity-50">
              {loading ? 'Predicting...' : 'Run prediction'}
            </button>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Result</p>
              <h3 className="text-lg font-semibold text-white">Prediction summary</h3>
            </div>
            <Sparkles className="h-5 w-5 text-accent" />
          </div>
          {result ? (
            <div className="rounded-[28px] border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10 p-5">
              <p className="text-sm text-slate-400">Confidence</p>
              <p className="mt-2 text-4xl font-semibold text-white">{(result.confidence * 100).toFixed(1)}%</p>
              <div className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm text-slate-300">
                Prediction: <strong className="text-white">{String(result.prediction)}</strong>
              </div>
            </div>
          ) : (
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 text-center text-sm text-slate-500">
              Run a prediction to see results here
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}

export default PredictionPage;
