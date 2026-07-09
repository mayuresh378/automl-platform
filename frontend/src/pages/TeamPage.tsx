import { motion } from 'framer-motion';
import { Users, Shield } from 'lucide-react';

function TeamPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Collaboration</p>
            <h2 className="text-2xl font-semibold text-white">Team members</h2>
          </div>
          <button className="rounded-2xl bg-primary/20 px-4 py-2 text-sm font-medium text-white">Invite member</button>
        </div>
        <div className="space-y-3">
          {[
            { name: 'Alicia Chen', role: 'Principal ML Lead', email: 'alicia@automl.io', status: 'Active', joined: '8 months ago' },
            { name: 'Marcus Rodriguez', role: 'Senior Data Scientist', email: 'marcus@automl.io', status: 'Active', joined: '6 months ago' },
            { name: 'Emma Johnson', role: 'ML Engineer', email: 'emma@automl.io', status: 'Active', joined: '3 months ago' },
            { name: 'James Park', role: 'Data Engineer', email: 'james@automl.io', status: 'Active', joined: '1 month ago' },
          ].map((member) => (
            <div key={member.name} className="rounded-[28px] border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white font-semibold">
                    {member.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-white">{member.name}</p>
                    <p className="text-sm text-slate-400">{member.role}</p>
                  </div>
                </div>
                <button className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10">
                  Manage
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
                <span>{member.email}</span>
                <span>{member.joined}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Permissions</p>
              <h3 className="text-lg font-semibold text-white">Role management</h3>
            </div>
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-3">
            {['Admin', 'Editor', 'Viewer', 'Analyst'].map((role) => (
              <div key={role} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-300">
                <span>{role}</span>
                <span className="text-slate-500">0 members</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Activity</p>
              <h3 className="text-lg font-semibold text-white">Recent actions</h3>
            </div>
            <Users className="h-5 w-5 text-accent" />
          </div>
          <div className="space-y-3">
            {['Emma joined team', 'James added API key', 'Marcus updated settings'].map((action) => (
              <div key={action} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                {action}
              </div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}

export default TeamPage;
