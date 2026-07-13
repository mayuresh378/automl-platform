import { motion } from 'framer-motion';
import { GitCompare, TrendingUp, Trophy, BarChart3 } from 'lucide-react';
import { staggerContainer, staggerItem } from '../lib/animations';

function ComparisonPage() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.section variants={staggerItem} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Benchmarking</p>
            <h2 className="text-2xl font-semibold text-white">Compare models across rigorous metrics</h2>
          </div>
          <div className="rounded-2xl bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">Best model selected</div>
        </div>
        <div className="overflow-hidden rounded-[28px] border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-white/5 text-left text-slate-400">
              <tr>
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3">Accuracy</th>
                <th className="px-4 py-3">Precision</th>
                <th className="px-4 py-3">Recall</th>
                <th className="px-4 py-3">F1</th>
                <th className="px-4 py-3">AUC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-slate-300">
              {[
                { name: 'Gradient Boosting', accuracy: '84.1%', precision: '0.82', recall: '0.81', f1: '0.81', auc: '0.91', best: true },
                { name: 'Random Forest', accuracy: '81.3%', precision: '0.79', recall: '0.78', f1: '0.78', auc: '0.88', best: false },
                { name: 'Logistic Regression', accuracy: '76.8%', precision: '0.72', recall: '0.71', f1: '0.72', auc: '0.84', best: false },
              ].map((model) => (
                <tr key={model.name} className="hover:bg-white/5">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {model.best ? <Trophy className="h-4 w-4 text-amber-400" /> : <GitCompare className="h-4 w-4 text-slate-500" />}
                      <span className="font-medium text-white">{model.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{model.accuracy}</td>
                  <td className="px-4 py-3">{model.precision}</td>
                  <td className="px-4 py-3">{model.recall}</td>
                  <td className="px-4 py-3">{model.f1}</td>
                  <td className="px-4 py-3">{model.auc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>

      <motion.section variants={staggerItem} className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Visualization</p>
              <h3 className="text-lg font-semibold text-white">ROC curves</h3>
            </div>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="h-48 rounded-[28px] border border-white/10 bg-gradient-to-br from-primary/10 to-accent/10" />
        </div>

        <div className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Interpretability</p>
              <h3 className="text-lg font-semibold text-white">Feature importance</h3>
            </div>
            <BarChart3 className="h-5 w-5 text-accent" />
          </div>
          <div className="space-y-3">
            {['Age', 'Income', 'Region', 'Retention'].map((feature, idx) => (
              <div key={feature}>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                  <span>{feature}</span>
                  <span>{84 - idx * 12}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${84 - idx * 12}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}

export default ComparisonPage;
