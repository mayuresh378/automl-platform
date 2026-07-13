import { motion } from 'framer-motion';
import { Zap, Clock3 } from 'lucide-react';
import { Button } from '../components/Button';
import { staggerContainer, staggerItem } from '../lib/animations';

function BatchPredictionsPage() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.section variants={staggerItem} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Bulk inference</p>
            <h2 className="text-2xl font-semibold text-white">Batch prediction jobs</h2>
          </div>
          <Button>New batch job</Button>
        </div>
        <div className="space-y-3">
          {[
            { name: 'churn_predictions_q3', model: 'churn_prediction_rf', rows: '245,000', status: 'Completed', progress: 100, created: '4 hours ago' },
            { name: 'fraud_scan_daily', model: 'fraud_detection_xgb', rows: '892,000', status: 'Processing', progress: 62, created: '1 hour ago' },
            { name: 'price_optimization_batch', model: 'price_optimization_lgb', rows: '156,000', status: 'Queued', progress: 0, created: '12 min ago' },
          ].map((job) => (
            <div key={job.name} className="rounded-[28px] border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="font-medium text-white">{job.name}</p>
                  <p className="text-sm text-slate-400">{job.model} • {job.rows} rows</p>
                </div>
                <div className={`rounded-full px-3 py-1 text-sm ${
                  job.status === 'Completed'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : job.status === 'Processing'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-slate-500/10 text-slate-400'
                }`}>
                  {job.status}
                </div>
              </div>
              <div className="mb-2 h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${job.progress}%` }} />
              </div>
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>{job.progress}% complete</span>
                <span>{job.created}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section variants={staggerItem} className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Configuration</p>
              <h3 className="text-lg font-semibold text-white">Create new batch</h3>
            </div>
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-slate-400">Select model</label>
              <select className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-slate-300">
                <option>fraud_detection_xgb</option>
                <option>churn_prediction_rf</option>
                <option>price_optimization_lgb</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400">Input dataset</label>
              <select className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-slate-300">
                <option>transactions_q3.parquet</option>
                <option>customer_export.csv</option>
              </select>
            </div>
            <Button className="w-full">Submit batch job</Button>
          </div>
        </div>

        <div className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Statistics</p>
              <h3 className="text-lg font-semibold text-white">Summary</h3>
            </div>
            <Clock3 className="h-5 w-5 text-accent" />
          </div>
          <div className="space-y-3">
            {[
              { label: 'Total jobs', value: '24' },
              { label: 'Completed', value: '18' },
              { label: 'Avg runtime', value: '8m 24s' },
              { label: 'Success rate', value: '99.5%' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-sm">
                <span className="text-slate-400">{stat.label}</span>
                <span className="font-semibold text-white">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}

export default BatchPredictionsPage;
