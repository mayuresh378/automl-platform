import { motion } from 'framer-motion';
import { Settings, ShieldCheck, BellRing, KeyRound, Globe2 } from 'lucide-react';

function SettingsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Workspace settings</p>
            <h2 className="text-2xl font-semibold text-white">Configure security, notifications, and integrations</h2>
          </div>
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { title: 'Security', icon: ShieldCheck, text: 'SSO and role-based access' },
            { title: 'Notifications', icon: BellRing, text: 'Run alerts and milestone updates' },
            { title: 'API Keys', icon: KeyRound, text: 'Manage service credentials' },
            { title: 'Language', icon: Globe2, text: 'Localized experience and regions' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-[28px] border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-slate-200">
                  <Icon className="h-4 w-4 text-accent" />
                  <span className="font-medium">{item.title}</span>
                </div>
                <p className="text-sm text-slate-400">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}

export default SettingsPage;
