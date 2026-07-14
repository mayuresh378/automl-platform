import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, Database, Boxes, FlaskConical, FolderKanban, Activity, HardDrive, Loader2, Search } from 'lucide-react';
import { BASE } from '../lib/api';
import { staggerContainer, staggerItem } from '../lib/animations';

function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [tab, setTab] = useState<'overview' | 'users' | 'logs'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${BASE}/admin/stats`).then(r => r.json()),
      fetch(`${BASE}/admin/users`).then(r => r.json()),
    ]).then(([s, u]) => { setStats(s); setUsers(u.users || []); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>;

  const statCards = stats ? [
    { label: 'Users', value: stats.users, icon: Users, color: 'text-accent' },
    { label: 'Projects', value: stats.projects, icon: FolderKanban, color: 'text-emerald-400' },
    { label: 'Datasets', value: stats.datasets, icon: Database, color: 'text-amber-400' },
    { label: 'Experiments', value: stats.experiments, icon: FlaskConical, color: 'text-rose-400' },
    { label: 'Models', value: stats.models, icon: Boxes, color: 'text-cyan-400' },
  ] : [];

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">Administration</p>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-accent" />
            Admin Panel
          </h1>
        </div>
        <div className="flex gap-2">
          {(['overview', 'users', 'logs'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-xl px-4 py-2 text-xs font-medium transition ${tab === t ? 'bg-accent/20 text-accent border border-accent/30' : 'text-slate-400 hover:text-white border border-white/10 bg-white/5'}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {tab === 'overview' && (
        <>
          <motion.div variants={staggerItem} className="grid gap-4 grid-cols-2 lg:grid-cols-5">
            {statCards.map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="card-hover rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">{s.label}</span>
                    <Icon className={`h-4 w-4 ${s.color}`} />
                  </div>
                  <p className="text-2xl font-semibold text-white">{s.value}</p>
                </div>
              );
            })}
          </motion.div>

          <motion.div variants={staggerItem} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
            <div className="flex items-center gap-2 mb-4">
              <HardDrive className="h-5 w-5 text-indigo-400" />
              <h3 className="text-lg font-semibold text-white">System overview</h3>
            </div>
            <div className="space-y-3">
              {statCards.map(s => {
                const Icon = s.icon;
                const maxVal = Math.max(stats.users, stats.projects, stats.datasets, stats.experiments, stats.models) || 1;
                return (
                  <div key={s.label} className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${s.color} shrink-0`} />
                    <span className="text-sm text-slate-300 w-24">{s.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-accent to-accent/60 transition-all" style={{ width: `${(s.value / maxVal) * 100}%` }} />
                    </div>
                    <span className="text-sm font-mono text-white w-12 text-right">{s.value}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}

      {tab === 'users' && (
        <motion.div variants={staggerItem} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Users</h3>
          <div className="space-y-2">
            {users.map((u: any) => (
              <div key={u.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-xs text-accent font-medium">{u.name?.charAt(0) || '?'}</div>
                  <div>
                    <p className="text-sm text-white">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] ${u.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{u.is_active ? 'Active' : 'Inactive'}</span>
                  <span className="text-[10px] text-slate-500">{u.role}</span>
                </div>
              </div>
            ))}
            {users.length === 0 && <p className="text-sm text-slate-500 text-center py-8">No users found.</p>}
          </div>
        </motion.div>
      )}

      {tab === 'logs' && (
        <motion.div variants={staggerItem} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Activity logs</h3>
          </div>
          <p className="text-sm text-slate-500">View activity from the Activity page.</p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default AdminPage;