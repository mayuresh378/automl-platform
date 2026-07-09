import { motion } from 'framer-motion';
import { Shield, Filter, Clock3 } from 'lucide-react';

function AuditLogsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Compliance & security</p>
            <h2 className="text-2xl font-semibold text-white">Audit trail</h2>
          </div>
          <div className="flex items-center gap-2">
            <input className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 placeholder-slate-500" placeholder="Search events" />
            <button className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-slate-300">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="overflow-hidden rounded-[28px] border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-white/5 text-left text-slate-400">
              <tr>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Resource</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-slate-300">
              {[
                { action: 'Model deployed', user: 'Alicia Chen', resource: 'credit_risk_gb v2.3', time: '2 hours ago', status: 'Success' },
                { action: 'Dataset uploaded', user: 'Marcus Rodriguez', resource: 'customer_churn.csv', time: '4 hours ago', status: 'Success' },
                { action: 'API key generated', user: 'Emma Johnson', resource: 'prod-key-2024', time: '1 day ago', status: 'Success' },
                { action: 'Access denied', user: 'Anonymous', resource: 'reports', time: '2 days ago', status: 'Failed' },
              ].map((log, idx) => (
                <tr key={idx} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-medium text-white">{log.action}</td>
                  <td className="px-4 py-3">{log.user}</td>
                  <td className="px-4 py-3">{log.resource}</td>
                  <td className="px-4 py-3">{log.time}</td>
                  <td className="px-4 py-3">
                    <div className={`inline-block rounded-full px-3 py-1 text-sm ${
                      log.status === 'Success'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-danger/10 text-danger'
                    }`}>
                      {log.status}
                    </div>
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
              <p className="text-sm text-slate-400">Summary</p>
              <h3 className="text-lg font-semibold text-white">Event statistics</h3>
            </div>
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: 'Total events', value: '2,847' },
              { label: 'Failed logins', value: '3' },
              { label: 'API calls', value: '18.2k' },
              { label: 'Data exports', value: '42' },
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
              <p className="text-sm text-slate-400">Filters</p>
              <h3 className="text-lg font-semibold text-white">Quick search</h3>
            </div>
            <Clock3 className="h-5 w-5 text-accent" />
          </div>
          <div className="space-y-2">
            {['Last 24 hours', 'Last 7 days', 'Last 30 days', 'All time'].map((period) => (
              <button key={period} className="block w-full rounded-2xl bg-white/5 px-4 py-3 text-sm text-left text-slate-300 transition hover:bg-white/10">
                {period}
              </button>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}

export default AuditLogsPage;
