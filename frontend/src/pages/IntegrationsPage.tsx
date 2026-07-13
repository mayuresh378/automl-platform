import { motion } from 'framer-motion';
import { CheckCircle2, Cable, Zap } from 'lucide-react';
import { Button } from '../components/Button';
import { staggerContainer, staggerItem } from '../lib/animations';

function IntegrationsPage() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.section variants={staggerItem} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Ecosystem</p>
            <h2 className="text-2xl font-semibold text-white">Third-party integrations</h2>
          </div>
          <Button>Browse marketplace</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'Snowflake', status: 'Connected', icon: '❄️' },
            { name: 'AWS S3', status: 'Connected', icon: '📦' },
            { name: 'Slack', status: 'Connected', icon: '💬' },
            { name: 'GitHub', status: 'Available', icon: '🐙' },
            { name: 'DataDog', status: 'Available', icon: '📊' },
            { name: 'PagerDuty', status: 'Available', icon: '🚨' },
          ].map((integration) => (
            <div key={integration.name} className="rounded-[28px] border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <span className="text-3xl">{integration.icon}</span>
                </div>
                <div className={`rounded-full px-3 py-1 text-sm ${
                  integration.status === 'Connected'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-slate-500/10 text-slate-400'
                }`}>
                  {integration.status}
                </div>
              </div>
              <p className="font-medium text-white">{integration.name}</p>
              {integration.status === 'Connected' && (
                <button className="btn-press mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10">
                  Manage
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section variants={staggerItem} className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Status</p>
              <h3 className="text-lg font-semibold text-white">Integration health</h3>
            </div>
            <Cable className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-3">
            {[
              { name: 'Snowflake sync', status: 'Healthy', uptime: '99.99%' },
              { name: 'AWS pipeline', status: 'Healthy', uptime: '99.98%' },
              { name: 'Slack notifications', status: 'Healthy', uptime: '100%' },
            ].map((service) => (
              <div key={service.name} className="rounded-2xl bg-white/5 px-4 py-3 text-sm">
                <div className="flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    {service.name}
                  </div>
                  <span className="text-slate-500">{service.uptime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Webhooks</p>
              <h3 className="text-lg font-semibold text-white">Event notifications</h3>
            </div>
            <Zap className="h-5 w-5 text-accent" />
          </div>
          <div className="space-y-2">
            {['Training completed', 'Model deployed', 'Error threshold reached', 'Data quality alert'].map((event) => (
              <div key={event} className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                {event}
              </div>
            ))}
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}

export default IntegrationsPage;
