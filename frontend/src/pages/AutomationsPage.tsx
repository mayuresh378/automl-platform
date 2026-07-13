import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, Webhook, Repeat, Bell, Plus, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { useUIStore } from '../store/useUIStore';

function AutomationsPage() {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const setActivePage = useUIStore((s) => s.setActivePage);

  useEffect(() => {
    api.webhooks.list().then(r => setWebhooks(r.webhooks)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Active automations', value: webhooks.filter(w => w.status === 'active').length, icon: Zap },
    { label: 'Webhooks configured', value: webhooks.length, icon: Webhook },
    { label: 'Triggers available', value: 3, icon: Repeat },
    { label: 'Notifications', value: 0, icon: Bell },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6 p-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
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
            <h2 className="text-2xl font-semibold text-white">Webhook automations</h2>
          </div>
          <button
            onClick={() => setActivePage('Deployment')}
            className="btn-press rounded-2xl bg-primary/20 px-4 py-2 text-sm font-medium text-white hover:bg-primary/30 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> New webhook
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
        ) : webhooks.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">No webhooks yet. Add one to automate workflows.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {webhooks.map((w: any) => (
              <div key={w.id} className="rounded-[28px] border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="font-medium text-white">{w.name}</p>
                    <p className="text-sm text-slate-400 truncate max-w-[200px]">{w.url}</p>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-sm ${w.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-500/10 text-zinc-400'}`}>
                    {w.status}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(w.events || []).map((ev: string) => (
                    <span key={ev} className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">{ev}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
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