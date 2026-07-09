import { motion } from 'framer-motion';
import { Cloud, Globe, CheckCircle2 } from 'lucide-react';

function DeploymentsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Model serving</p>
            <h2 className="text-2xl font-semibold text-white">Deployed endpoints</h2>
          </div>
          <button className="rounded-2xl bg-primary/20 px-4 py-2 text-sm font-medium text-white">Deploy model</button>
        </div>
        <div className="space-y-3">
          {[
            { name: 'credit_risk_prod', model: 'credit_risk_gb v2.3', endpoint: 'api.automl.io/v1/credit-risk', status: 'Active', qps: '1.2k' },
            { name: 'fraud_detection', model: 'fraud_detection_xgb v1.8', endpoint: 'api.automl.io/v1/fraud', status: 'Active', qps: '890' },
            { name: 'churn_staging', model: 'churn_prediction_rf v3.1', endpoint: 'staging.automl.io/v1/churn', status: 'Healthy', qps: '12' },
          ].map((deploy) => (
            <div key={deploy.name} className="rounded-[28px] border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="font-medium text-white">{deploy.name}</p>
                  <p className="text-sm text-slate-400">{deploy.model}</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  {deploy.status}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>{deploy.endpoint}</span>
                <span>{deploy.qps} req/s</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Monitoring</p>
              <h3 className="text-lg font-semibold text-white">Deployment health</h3>
            </div>
            <Cloud className="h-5 w-5 text-primary" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: 'Uptime', value: '99.98%', color: 'emerald' },
              { label: 'Avg latency', value: '45ms', color: 'blue' },
              { label: 'Error rate', value: '0.01%', color: 'emerald' },
              { label: 'Total requests', value: '2.3M', color: 'cyan' },
            ].map((metric) => (
              <div key={metric.label} className={`rounded-3xl border border-${metric.color}-500/20 bg-${metric.color}-500/10 p-4`}>
                <p className="text-sm text-slate-400">{metric.label}</p>
                <p className="mt-1 text-2xl font-semibold text-white">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Regional</p>
              <h3 className="text-lg font-semibold text-white">Endpoints</h3>
            </div>
            <Globe className="h-5 w-5 text-accent" />
          </div>
          <div className="space-y-2">
            {['US East', 'EU West', 'APAC', 'US West'].map((region) => (
              <div key={region} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-300">
                <span>{region}</span>
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}

export default DeploymentsPage;
