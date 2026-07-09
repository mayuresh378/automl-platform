import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, Webhook, Repeat, Bell, Plus } from 'lucide-react';
import { api } from '../lib/api';
import { useUIStore } from '../store/useUIStore';

function AutomationsPage() {
  const [models, setModels] = useState<any[]>([]);
  const setActivePage = useUIStore((s) => s.setActivePage);

  useEffect(() => {
    api.models.list().then(r => setModels(r.models)).catch(() => {});
  }, []);

  const automations = [
    { name: 'Daily retrain', trigger: 'Scheduled', schedule: 'Every 24h', target: 'All deployed models', active: true },
    { name: 'Data drift alert', trigger: 'Event', schedule: 'On drift detected', target: 'Churn model v2', active: true },
    { name: 'Webhook: Slack notify', trigger: 'Webhook', schedule: 'On training complete', target: '#ml-alerts', active: false },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6 p-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Active automations', value: automations.filter(a => a.active).length, icon: Zap },
          { label: 'Models monitored', value: models.length, icon: Bell },
          { label: 'Triggers configured', value: 3, icon: Repeat },
          { label: 'Webhooks active', value: 1, icon: Webhook },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">{stat.label}</span>
                <Icon className="h-4 w-4 text-accent" />
              </div>
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Rules & triggers</p>
            <h2 className="text-2xl font-semibold text-white">Automations</h2>
          </div>
          <button
            onClick={() => setActivePage('Deployment')}
            className="rounded-2xl bg-primary/20 px-4 py-2 text-sm font-medium text-white hover:bg-primary/30 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New automation
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {automations.map((a) => (
            <div key={a.name} className="rounded-[28px] border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <p className="font-medium text-white">{a.name}</p>
                  <p className="text-sm text-slate-400">{a.trigger} trigger</p>
                </div>
                <div className={`rounded-full px-3 py-1 text-sm ${a.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-500/10 text-zinc-400'}`}>
                  {a.active ? 'Active' : 'Paused'}
                </div>
              </div>
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Schedule</span>
                  <span className="text-white">{a.schedule}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Target</span>
                  <span className="text-white">{a.target}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Integration</p>
            <h3 className="text-lg font-semibold text-white">Available triggers</h3>
          </div>
          <Zap className="h-5 w-5 text-accent" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: Clock, label: 'Schedule', desc: 'Cron-based recurring runs' },
            { icon: Repeat, label: 'Model update', desc: 'Trigger on new model version' },
            { icon: Webhook, label: 'Webhook', desc: 'HTTP call from external system' },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center">
                <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-white">{t.label}</p>
                <p className="text-xs text-slate-400 mt-1">{t.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}

export default AutomationsPage;
