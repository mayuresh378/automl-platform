import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Users, Shield, Copy, CheckCheck, Plus, Trash2, Eye, EyeOff, LogIn, Monitor, Globe, Chrome, Smartphone, XCircle, Mail, Lock, User, UserPlus, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../lib/api';

const ROLES = ['Admin', 'Editor', 'Viewer'];
const PERMISSIONS = [
  { key: 'View datasets', admin: true, editor: true, viewer: true },
  { key: 'Upload datasets', admin: true, editor: true, viewer: false },
  { key: 'Delete datasets', admin: true, editor: false, viewer: false },
  { key: 'Train models', admin: true, editor: true, viewer: false },
  { key: 'Deploy models', admin: true, editor: true, viewer: false },
  { key: 'Manage users', admin: true, editor: false, viewer: false },
  { key: 'View experiments', admin: true, editor: true, viewer: true },
  { key: 'API access', admin: true, editor: true, viewer: false },
  { key: 'Billing', admin: true, editor: false, viewer: false },
  { key: 'Manage API keys', admin: true, editor: false, viewer: false },
];

const PROVIDERS = [
  { name: 'Google', icon: Globe, connected: true, email: 'mayuresh@google.com' },
  { name: 'GitHub', icon: Chrome, connected: true, email: 'mayuresh378' },
  { name: 'Microsoft', icon: Monitor, connected: false, email: null },
  { name: 'Apple', icon: Smartphone, connected: false, email: null },
];

function AuthenticationPage() {
  const { user, token, setAuth, logout } = useAuthStore();
  const isLoggedIn = !!token && !!user && user.id !== 'anonymous';

  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState<string | null>(null);

  const [apiKeys] = useState([
    { id: '1', name: 'Production API Key', key: 'amk_prod_a1b2c3d4e5f6g7h8i9j0', created: '2026-06-15', lastUsed: '2026-07-09', status: 'active' },
    { id: '2', name: 'Development Key', key: 'amk_dev_k1l2m3n4o5p6q7r8s9t0', created: '2026-07-01', lastUsed: '2026-07-08', status: 'active' },
    { id: '3', name: 'Staging Key', key: 'amk_stg_u1v2w3x4y5z6a7b8c9d0', created: '2026-05-20', lastUsed: '2026-06-30', status: 'revoked' },
  ]);

  const [users] = useState([
    { id: '1', name: 'Mayuresh Joshi', email: 'mayuresh@example.com', role: 'Admin', status: 'active', mfa: true, sessions: 3 },
    { id: '2', name: 'Priya Sharma', email: 'priya@example.com', role: 'Editor', status: 'active', mfa: false, sessions: 1 },
    { id: '3', name: 'Rahul Verma', email: 'rahul@example.com', role: 'Viewer', status: 'active', mfa: false, sessions: 2 },
    { id: '4', name: 'Ananya Patel', email: 'ananya@example.com', role: 'Editor', status: 'inactive', mfa: true, sessions: 0 },
  ]);

  const [sessions] = useState([
    { id: '1', user: 'Mayuresh Joshi', device: 'Chrome on Windows', ip: '203.0.113.42', location: 'Mumbai, IN', lastActive: '2 min ago', current: true },
    { id: '2', user: 'Mayuresh Joshi', device: 'Safari on macOS', ip: '198.51.100.7', location: 'Pune, IN', lastActive: '3 hours ago', current: false },
    { id: '3', user: 'Priya Sharma', device: 'Firefox on Linux', ip: '192.0.2.15', location: 'Delhi, IN', lastActive: '1 day ago', current: false },
    { id: '4', user: 'Rahul Verma', device: 'Mobile Chrome on Android', ip: '203.0.113.88', location: 'Bangalore, IN', lastActive: '2 days ago', current: false },
  ]);

  const [authLog] = useState([
    { event: 'Login successful', user: 'Mayuresh Joshi', ip: '203.0.113.42', time: '2 min ago', status: 'success' },
    { event: 'API key used', user: 'Production Key', ip: '198.51.100.7', time: '15 min ago', status: 'success' },
    { event: 'Failed login attempt', user: 'unknown@example.com', ip: '45.33.32.156', time: '1 hour ago', status: 'failed' },
    { event: 'Password changed', user: 'Priya Sharma', ip: '192.0.2.15', time: '3 hours ago', status: 'success' },
    { event: 'MFA challenge passed', user: 'Mayuresh Joshi', ip: '203.0.113.42', time: '5 hours ago', status: 'success' },
    { event: 'Session expired', user: 'Rahul Verma', ip: '203.0.113.88', time: '1 day ago', status: 'warning' },
    { event: 'API key revoked', user: 'Staging Key', ip: '198.51.100.7', time: '2 days ago', status: 'warning' },
    { event: 'New device login', user: 'Ananya Patel', ip: '192.0.2.50', time: '3 days ago', status: 'success' },
  ]);

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await api.auth.login(loginEmail, loginPassword);
      setAuth(res.token, res.user);
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await api.auth.register(signupEmail, signupPassword, signupName);
      setAuth(res.token, res.user);
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const activeUsers = users.filter(u => u.status === 'active').length;
  const activeKeys = apiKeys.filter(k => k.status === 'active').length;
  const mfaCount = users.filter(u => u.mfa).length;
  const activeSessions = sessions.filter(s => s.current || s.lastActive !== '2 days ago').length;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Active users', value: activeUsers, icon: Users },
          { label: 'Active sessions', value: activeSessions, icon: LogIn },
          { label: 'API keys', value: activeKeys, icon: KeyRound },
          { label: 'MFA enabled', value: mfaCount, icon: Shield },
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

      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          {isLoggedIn ? (
            <div className="text-center py-6">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-accent to-secondary mx-auto mb-4 text-lg font-semibold text-white">
                {user!.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">{user!.name}</h3>
              <p className="text-sm text-slate-400 mb-4">{user!.email}</p>
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-sm text-emerald-400 inline-flex items-center gap-2">
                <Shield className="h-4 w-4" /> Authenticated
              </div>
              <button onClick={logout} className="mt-6 w-full rounded-xl border border-white/10 py-2 text-sm text-danger hover:bg-white/[0.03] transition-colors">Sign out</button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-5">
                <button onClick={() => setAuthTab('login')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${authTab === 'login' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}`}>Sign in</button>
                <button onClick={() => setAuthTab('signup')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${authTab === 'signup' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}`}>Create account</button>
              </div>

              {authError && (
                <div className="mb-4 rounded-xl bg-danger/10 border border-danger/20 px-4 py-2 text-sm text-danger">{authError}</div>
              )}

              {authTab === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <p className="text-sm text-slate-500 mb-4">Sign in to access API keys, manage team members, and more.</p>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50" required />
                    </div>
                  </div>
                  <button type="submit" disabled={authLoading} className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50">
                    <LogIn className="h-4 w-4" /> {authLoading ? 'Signing in…' : 'Sign in'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  <p className="text-sm text-slate-500 mb-4">Create a free account to save experiments and manage your team.</p>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input type="text" value={signupName} onChange={e => setSignupName(e.target.value)} placeholder="Your name" className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input type="password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50" required minLength={6} />
                    </div>
                  </div>
                  <button type="submit" disabled={authLoading} className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50">
                    <UserPlus className="h-4 w-4" /> {authLoading ? 'Creating account…' : 'Create account'}
                  </button>
                </form>
              )}
            </>
          )}
        </section>

        <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm text-slate-400">API access</p>
              <h3 className="text-lg font-semibold text-white">API keys</h3>
            </div>
            <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50" disabled={!isLoggedIn}>
              <KeyRound className="h-4 w-4" />
              New key
            </button>
          </div>
          {!isLoggedIn ? (
            <div className="py-8 text-center text-sm text-slate-500">Sign in to manage API keys</div>
          ) : (
            <div className="space-y-2">
              {apiKeys.map((ak) => (
                <div key={ak.id} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-white">{ak.name}</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => copyKey(ak.key)} className="p-1 rounded-lg hover:bg-white/[0.05] text-slate-400 hover:text-white transition-colors">
                        {copiedKey === ak.key ? <CheckCheck className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={() => setShowKey(showKey === ak.id ? null : ak.id)} className="p-1 rounded-lg hover:bg-white/[0.05] text-slate-400 hover:text-white transition-colors">
                        {showKey === ak.id ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                      <button className="p-1 rounded-lg hover:bg-white/[0.05] text-slate-400 hover:text-white transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-mono text-slate-500">
                      {showKey === ak.id ? ak.key : `${ak.key.slice(0, 12)}••••••••`}
                    </p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${ak.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {ak.status}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-3 text-[10px] text-slate-600">
                    <span>Created {ak.created}</span>
                    <span>Last used {ak.lastUsed}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm text-slate-400">Team members</p>
              <h3 className="text-lg font-semibold text-white">User management</h3>
            </div>
            <button className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium transition-opacity ${isLoggedIn ? 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90' : 'bg-white/5 text-slate-500 cursor-not-allowed'}`} disabled={!isLoggedIn}>
              <Plus className="h-4 w-4" /> Invite
            </button>
          </div>
          {!isLoggedIn ? (
            <div className="py-8 text-center text-sm text-slate-500">Sign in to manage team members</div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-9 w-9 rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-semibold text-white">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${user.role === 'Admin' ? 'bg-accent/10 text-accent' : user.role === 'Editor' ? 'bg-primary/10 text-primary' : 'bg-white/10 text-slate-400'}`}>{user.role}</span>
                    {user.mfa && <Shield className="h-3.5 w-3.5 text-emerald-400" />}
                    {user.sessions > 0 && <span className="text-[10px] text-slate-500">{user.sessions} sessions</span>}
                    <span className={`h-2 w-2 rounded-full ${user.status === 'active' ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-5">
            <p className="text-sm text-slate-400">Access control</p>
            <h3 className="text-lg font-semibold text-white">Role permissions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-400">Permission</th>
                  {ROLES.map(r => (<th key={r} className="px-3 py-2 text-center text-xs font-medium text-slate-400">{r}</th>))}
                </tr>
              </thead>
              <tbody>
                {PERMISSIONS.map((perm) => (
                  <tr key={perm.key} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-3 py-2.5 text-sm text-zinc-300">{perm.key}</td>
                    {ROLES.map(r => {
                      const val = perm[r.toLowerCase() as keyof typeof perm];
                      return (
                        <td key={r} className="px-3 py-2.5 text-center">
                          {typeof val === 'boolean' && (
                            <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] ${val ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-600'}`}>{val ? '✓' : '—'}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm text-slate-400">Sessions</p>
              <h3 className="text-lg font-semibold text-white">Active sessions</h3>
            </div>
            <button className={`flex items-center gap-2 rounded-xl border border-white/10 px-3 py-1.5 text-xs transition-colors ${isLoggedIn ? 'text-slate-400 hover:text-white' : 'text-slate-600 cursor-not-allowed'}`} disabled={!isLoggedIn}>
              <XCircle className="h-3.5 w-3.5" /> Revoke all
            </button>
          </div>
          {!isLoggedIn ? (
            <div className="py-8 text-center text-sm text-slate-500">Sign in to view sessions</div>
          ) : (
            <div className="space-y-2">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/5 shrink-0">
                      {s.device.includes('Chrome') ? <Globe className="h-4 w-4 text-sky-400" /> : s.device.includes('Safari') ? <Monitor className="h-4 w-4 text-blue-400" /> : s.device.includes('Android') ? <Smartphone className="h-4 w-4 text-emerald-400" /> : <Monitor className="h-4 w-4 text-slate-400" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{s.device}</p>
                      <p className="text-xs text-slate-500">{s.ip} · {s.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-slate-500">{s.lastActive}</span>
                    {s.current ? (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">Current</span>
                    ) : (
                      <button className="rounded-lg p-1 text-slate-500 hover:text-danger transition-colors"><XCircle className="h-3.5 w-3.5" /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-5">
            <p className="text-sm text-slate-400">Audit trail</p>
            <h3 className="text-lg font-semibold text-white">Authentication log</h3>
          </div>
          <div className="space-y-1.5">
            {authLog.map((entry, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl px-3 py-2 hover:bg-white/[0.02] transition-colors">
                <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${entry.status === 'success' ? 'bg-emerald-500' : entry.status === 'failed' ? 'bg-danger' : 'bg-yellow-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-zinc-300 truncate">{entry.event}</p>
                    <span className="text-[10px] text-slate-600 shrink-0">{entry.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 truncate">{entry.user} · {entry.ip}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-5">
          <p className="text-sm text-slate-400">Security</p>
          <h3 className="text-lg font-semibold text-white">Authentication settings</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { label: 'Multi-factor authentication', desc: 'Require MFA for all team members', enabled: true },
            { label: 'Session timeout', desc: 'Auto-logout after 24 hours of inactivity', enabled: true },
            { label: 'Password policy', desc: 'Min 8 chars, 1 uppercase, 1 special char', enabled: true },
            { label: 'Single sign-on (SSO)', desc: 'SAML / OIDC integration', enabled: false },
            { label: 'IP allowlist', desc: 'Restrict access to trusted IPs', enabled: false },
            { label: 'Rate limiting', desc: 'Max 5 failed attempts before lockout', enabled: true },
          ].map((setting) => (
            <div key={setting.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">{setting.label}</p>
                <p className="text-xs text-slate-500 truncate">{setting.desc}</p>
              </div>
              <div className={`h-6 w-10 rounded-full transition-colors shrink-0 ${setting.enabled ? 'bg-primary' : 'bg-white/10'} relative cursor-pointer`}>
                <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${setting.enabled ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-5">
          <p className="text-sm text-slate-400">Identity providers</p>
          <h3 className="text-lg font-semibold text-white">OAuth & social login</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {PROVIDERS.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-white/5"><Icon className="h-5 w-5 text-slate-300" /></div>
                  <div>
                    <p className="text-sm font-medium text-white">{p.name}</p>
                    {p.connected && p.email ? <p className="text-xs text-slate-500">Connected as {p.email}</p> : <p className="text-xs text-slate-600">Not connected</p>}
                  </div>
                </div>
                <div className={`h-6 w-10 rounded-full transition-colors shrink-0 ${p.connected ? 'bg-primary' : 'bg-white/10'} relative cursor-pointer`}>
                  <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${p.connected ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}

export default AuthenticationPage;
