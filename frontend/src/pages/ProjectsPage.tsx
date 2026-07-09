import { motion } from 'framer-motion';
import { FolderOpen, Star } from 'lucide-react';

function ProjectsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Workspace organization</p>
            <h2 className="text-2xl font-semibold text-white">Active projects</h2>
          </div>
          <button className="rounded-2xl bg-primary/20 px-4 py-2 text-sm font-medium text-white">New project</button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'Customer Churn', models: 5, status: 'Production', updated: '2 hours ago' },
            { name: 'Fraud Detection', models: 8, status: 'Staging', updated: '1 day ago' },
            { name: 'Price Optimization', models: 3, status: 'Development', updated: '3 days ago' },
          ].map((project) => (
            <div key={project.name} className="rounded-[28px] border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <p className="font-medium text-white">{project.name}</p>
                  <p className="text-sm text-slate-400">{project.models} models</p>
                </div>
                <button className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:text-white">
                  <Star className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">{project.status}</div>
                <span className="text-sm text-slate-500">{project.updated}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Quick actions</p>
            <h3 className="text-lg font-semibold text-white">Get started</h3>
          </div>
          <FolderOpen className="h-5 w-5 text-accent" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {['Create new project', 'Import existing dataset', 'View templates', 'Invite team members'].map((action) => (
            <button key={action} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">
              {action}
            </button>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

export default ProjectsPage;
