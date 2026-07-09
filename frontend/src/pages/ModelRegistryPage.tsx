import { motion } from 'framer-motion';
import { Package, Zap } from 'lucide-react';

function ModelRegistryPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Model repository</p>
            <h2 className="text-2xl font-semibold text-white">Trained models library</h2>
          </div>
          <button className="rounded-2xl bg-primary/20 px-4 py-2 text-sm font-medium text-white">Upload model</button>
        </div>
        <div className="overflow-hidden rounded-[28px] border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-white/5 text-left text-slate-400">
              <tr>
                <th className="px-4 py-3">Model Name</th>
                <th className="px-4 py-3">Version</th>
                <th className="px-4 py-3">Accuracy</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-slate-300">
              {[
                { name: 'credit_risk_gb', version: 'v2.3.1', accuracy: '0.89', created: '2 days ago', status: 'Production' },
                { name: 'fraud_detection_xgb', version: 'v1.8.0', accuracy: '0.94', created: '1 week ago', status: 'Production' },
                { name: 'churn_prediction_rf', version: 'v3.1.2', accuracy: '0.87', created: '3 days ago', status: 'Staging' },
              ].map((model) => (
                <tr key={model.name} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-medium text-white">{model.name}</td>
                  <td className="px-4 py-3">{model.version}</td>
                  <td className="px-4 py-3">{model.accuracy}</td>
                  <td className="px-4 py-3">{model.created}</td>
                  <td className="px-4 py-3">
                    <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">{model.status}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Statistics</p>
              <h3 className="text-lg font-semibold text-white">Registry overview</h3>
            </div>
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: 'Total models', value: '24' },
              { label: 'In production', value: '8' },
              { label: 'Latest version', value: 'v3.1.2' },
              { label: 'Total deployments', value: '14' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className="mt-1 text-2xl font-semibold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Latest</p>
              <h3 className="text-lg font-semibold text-white">Recently added</h3>
            </div>
            <Zap className="h-5 w-5 text-accent" />
          </div>
          <div className="space-y-3">
            {['churn_prediction_rf', 'price_optimization_lgb', 'anomaly_detection_ae'].map((model) => (
              <div key={model} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                {model}
              </div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}

export default ModelRegistryPage;
