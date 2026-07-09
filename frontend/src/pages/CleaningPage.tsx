import { motion } from 'framer-motion';
import { Sparkles, SlidersHorizontal, RefreshCw, CheckCircle2, Undo2 } from 'lucide-react';

function CleaningPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Data engineering</p>
            <h2 className="text-2xl font-semibold text-white">Clean and transform your dataset with confidence</h2>
          </div>
          <button className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white">Apply pipeline</button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-200">
              <Sparkles className="h-4 w-4 text-accent" />
              Recommended actions
            </div>
            <div className="space-y-3">
              {['Impute missing revenue values', 'Encode categorical regions', 'Scale numeric features', 'Remove sparse outliers'].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#111827]/70 px-4 py-3 text-sm text-slate-300">
                  <span>{item}</span>
                  <button className="rounded-xl bg-white/10 px-3 py-1 text-xs text-white">Apply</button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-primary/10 to-accent/10 p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-200">
              <RefreshCw className="h-4 w-4 text-primary" />
              Preview summary
            </div>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3"><span>Rows after cleaning</span><span>18,240</span></div>
              <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3"><span>Features retained</span><span>11</span></div>
              <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3"><span>Schema consistency</span><span>High</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Pipeline</p>
              <h3 className="text-lg font-semibold text-white">Transformation steps</h3>
            </div>
            <SlidersHorizontal className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-3">
            {['Missing values handled', 'Categorical encoding applied', 'Feature scaling enabled'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Recovery</p>
              <h3 className="text-lg font-semibold text-white">Versioning</h3>
            </div>
            <Undo2 className="h-5 w-5 text-accent" />
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            Revert any transformation safely and compare before/after data quality metrics.
          </div>
        </div>
      </section>
    </motion.div>
  );
}

export default CleaningPage;
