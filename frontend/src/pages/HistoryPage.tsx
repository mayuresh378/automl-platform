import { motion } from 'framer-motion';
import { History } from 'lucide-react';

function HistoryPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Audit trail</p>
            <h2 className="text-2xl font-semibold text-white">Track every action and experiment</h2>
          </div>
          <div className="rounded-2xl bg-white/10 px-3 py-1 text-sm text-slate-300">147 events</div>
        </div>
        <div className="space-y-3">
          {[
            { name: 'Training run completed', time: '12 min ago', state: 'Success' },
            { name: 'Dataset uploaded', time: '1 hour ago', state: 'Success' },
            { name: 'Feature pipeline updated', time: '3 hours ago', state: 'Pending review' },
          ].map((item) => (
            <div key={item.name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              <div className="flex items-center gap-3">
                <History className="h-4 w-4 text-primary" />
                <span>{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-500">{item.time}</span>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-400">{item.state}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

export default HistoryPage;
