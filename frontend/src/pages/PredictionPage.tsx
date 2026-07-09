import { motion } from 'framer-motion';
import { Send, Sparkles, Copy, TrendingUp } from 'lucide-react';

function PredictionPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Inference</p>
              <h2 className="text-2xl font-semibold text-white">Serve predictions with explainability</h2>
            </div>
            <button className="rounded-2xl bg-primary/20 px-4 py-2 text-sm font-medium text-primary-100">Run prediction</button>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-200">
              <Send className="h-4 w-4 text-accent" />
              Input payload
            </div>
            <textarea className="min-h-40 w-full rounded-2xl border border-white/10 bg-[#111827]/70 p-4 text-sm text-slate-300 outline-none" defaultValue='{"age": 42, "income": 89100, "region": "west", "tenure": 7}' />
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
          <div className="rounded-[28px] border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10 p-5">
            <p className="text-sm text-slate-400">Confidence</p>
            <p className="mt-2 text-4xl font-semibold text-white">94.6%</p>
            <div className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm text-slate-300">Prediction: customer will churn</div>
            <div className="mt-4 flex gap-2">
              <button className="rounded-2xl bg-white/10 px-3 py-2 text-sm text-white">Copy result</button>
              <button className="rounded-2xl bg-white/10 px-3 py-2 text-sm text-white">Export</button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Explainability</p>
              <h3 className="text-lg font-semibold text-white">Feature contribution</h3>
            </div>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-3">
            {['Tenure', 'Income', 'Engagement score', 'Region'].map((item, idx) => (
              <div key={item}>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                  <span>{item}</span>
                  <span>{(24 - idx * 4)}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${24 - idx * 4}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">History</p>
              <h3 className="text-lg font-semibold text-white">Recent predictions</h3>
            </div>
            <Copy className="h-5 w-5 text-accent" />
          </div>
          <div className="space-y-3">
            {['High risk • 2 min ago', 'Medium risk • 11 min ago', 'Low risk • 1 hour ago'].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">{item}</div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}

export default PredictionPage;
