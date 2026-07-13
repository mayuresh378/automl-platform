import { motion } from 'framer-motion';
import { GitBranch, GitCompare, Zap } from 'lucide-react';
import { Button } from '../components/Button';
import { staggerContainer, staggerItem } from '../lib/animations';

function DataVersioningPage() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.section variants={staggerItem} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Dataset management</p>
            <h2 className="text-2xl font-semibold text-white">Version control</h2>
          </div>
          <Button>Create version</Button>
        </div>
        <div className="space-y-3">
          {[
            { version: 'v1.2.3', status: 'Current', size: '24.8 MB', rows: '18,240', created: '2 hours ago' },
            { version: 'v1.2.2', status: 'Previous', size: '24.6 MB', rows: '18,156', created: '1 day ago' },
            { version: 'v1.2.1', status: 'Archive', size: '24.1 MB', rows: '18,040', created: '3 days ago' },
          ].map((ver) => (
            <div key={ver.version} className="rounded-[28px] border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-primary" />
                    <p className="font-mono font-semibold text-white">{ver.version}</p>
                  </div>
                  <p className="text-sm text-slate-400">
                    {ver.rows} rows • {ver.size}
                  </p>
                </div>
                <div className={`rounded-full px-3 py-1 text-sm ${
                  ver.status === 'Current'
                    ? 'bg-primary/20 text-primary'
                    : 'bg-slate-500/10 text-slate-400'
                }`}>
                  {ver.status}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Created {ver.created}</span>
                <button className="btn-press rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-white transition hover:bg-white/10">
                  Rollback
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section variants={staggerItem} className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Comparison</p>
              <h3 className="text-lg font-semibold text-white">Version diff</h3>
            </div>
            <GitCompare className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-3">
            {[
              { change: 'Rows added', value: '84' },
              { change: 'Rows removed', value: '0' },
              { change: 'Columns modified', value: '2' },
              { change: 'Missing values changed', value: '+2.1%' },
            ].map((item) => (
              <div key={item.change} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-sm">
                <span className="text-slate-300">{item.change}</span>
                <span className="font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Lineage</p>
              <h3 className="text-lg font-semibold text-white">Data provenance</h3>
            </div>
            <Zap className="h-5 w-5 text-accent" />
          </div>
          <div className="space-y-2">
            {['Uploaded manually', 'Synced from Snowflake', 'Transformed pipeline', 'Validated & tagged'].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-300">
                <div className="h-2 w-2 rounded-full bg-primary" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}

export default DataVersioningPage;
