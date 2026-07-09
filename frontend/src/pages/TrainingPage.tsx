import { motion } from 'framer-motion';
import { BrainCircuit, PlayCircle, TimerReset, Cpu, HardDrive, Zap } from 'lucide-react';

function TrainingPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Train models</p>
              <h2 className="text-2xl font-semibold text-white">Launch production-grade experiments</h2>
            </div>
            <button className="rounded-2xl bg-primary/20 px-4 py-2 text-sm font-medium text-white">Start run</button>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-primary/10 to-accent/10 p-5">
            <div className="mb-4 flex items-center gap-3 text-white">
              <BrainCircuit className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium">Gradient Boosting</p>
                <p className="text-sm text-slate-400">84.1% validation accuracy</p>
              </div>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div className="h-2 w-3/4 rounded-full bg-gradient-to-r from-primary to-accent" />
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
              <span>Training in progress</span>
              <span>12 min remaining</span>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Queue</p>
              <h3 className="text-lg font-semibold text-white">Scheduled runs</h3>
            </div>
            <PlayCircle className="h-5 w-5 text-accent" />
          </div>
          <div className="space-y-3">
            {['XGBoost', 'LightGBM', 'CatBoost'].map((model) => (
              <div key={model} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">{model}</div>
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

        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Controls</p>
              <h3 className="text-lg font-semibold text-white">Experiment actions</h3>
            </div>
            <TimerReset className="h-5 w-5 text-accent" />
          </div>
          <div className="space-y-3">
            <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white">Pause run</button>
            <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white">Resume run</button>
            <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">Cancel run</button>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

export default TrainingPage;
