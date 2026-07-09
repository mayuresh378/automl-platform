import { motion } from 'framer-motion';
import { Wand2, PlusCircle, Bot, Sparkles } from 'lucide-react';

function EngineeringPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Feature intelligence</p>
            <h2 className="text-2xl font-semibold text-white">Craft high-signal features with AI assistance</h2>
          </div>
          <button className="rounded-2xl bg-primary/20 px-4 py-2 text-sm font-medium text-white">Generate features</button>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-200">
              <Wand2 className="h-4 w-4 text-primary" />
              Suggested transforms
            </div>
            <div className="space-y-3">
              {['Polynomial interaction terms', 'Time-based seasonality', 'Binned frequency encoding', 'Target-aware embeddings'].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-[#111827]/70 px-4 py-3 text-sm text-slate-300">{item}</div>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-accent/10 to-primary/10 p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-200">
              <Bot className="h-4 w-4 text-accent" />
              Copilot recommendation
            </div>
            <p className="text-sm text-slate-300">The model benefits from a rolling-window feature over the last 7 days. Generating it now will improve temporal stability.</p>
            <button className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-sm font-medium text-white">
              <PlusCircle className="h-4 w-4" />
              Add feature
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Feature store</p>
            <h3 className="text-lg font-semibold text-white">Generated features</h3>
          </div>
          <Sparkles className="h-5 w-5 text-accent" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {['seasonality_score', 'rolling_7d', 'interaction_rate'].map((feature) => (
            <div key={feature} className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-medium text-white">{feature}</p>
              <p className="mt-2 text-sm text-slate-400">High importance • ready for training</p>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

export default EngineeringPage;
