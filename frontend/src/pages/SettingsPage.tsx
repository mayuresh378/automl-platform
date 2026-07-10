import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, KeyRound, CreditCard, ShieldCheck, User, Mail, Lock, LogIn, UserPlus, Globe, Chrome, Monitor, Smartphone, Copy, CheckCheck, Eye, EyeOff, Trash2, Plus, XCircle, Bell, Palette, ChevronRight, Loader2 } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../lib/api';

const TABS = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'authentication', label: 'Authentication', icon: KeyRound },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'admin', label: 'Admin', icon: ShieldCheck },
];

function GeneralTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Profile</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Display name</label>
            <input type="text" defaultValue="Mayuresh Joshi" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Email</label>
            <input type="email" defaultValue="mayuresh@example.com" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50" />
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Preferences</h3>
        <div className="space-y-3">
          {[
            { label: 'Email notifications', desc: 'Receive updates about training completions', icon: Bell },
            { label: 'Dark mode', desc: 'Use dark theme across the platform', icon: Palette },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-white">{s.label}</p>
                    <p className="text-xs text-slate-500">{s.desc}</p>
                  </div>
                </div>
                <div className="h-6 w-10 rounded-full bg-primary relative cursor-pointer">
                  <div className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow translate-x-[18px]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AuthenticationTab() {
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

  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [keysLoading, setKeysLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      setKeysLoading(true);
      Promise.all([
        api.apiKeys.list().then(r => setApiKeys(r.api_keys)).catch(() => {}),
        api.teams.list().then(r => setTeams(r.teams)).catch(() => {}),
      ]).finally(() => setKeysLoading(false));
    }
  }, [isLoggedIn]);

  const copyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateKey = async () => {
    const name = prompt('Enter a name for the API key:');
    if (!name) return;
    try {
      const result = await api.apiKeys.create(name);
      setApiKeys(prev => [...prev, { id: result.id, name: result.name, key_prefix: result.key_prefix, key: result.key, status: 'active' }]);
      if (result.key) copyKey(result.key, result.id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Delete this API key? This cannot be undone.')) return;
    try {
      await api.apiKeys.remove(keyId);
      setApiKeys(prev => prev.filter(k => k.id !== keyId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(''); setAuthLoading(true);
    try { const res = await api.auth.login(loginEmail, loginPassword); setAuth(res.token, res.user); }
    catch (err: any) { setAuthError(err.message); }
    finally { setAuthLoading(false); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(''); setAuthLoading(true);
    try { const res = await api.auth.register(signupEmail, signupPassword, signupName); setAuth(res.token, res.user); }
    catch (err: any) { setAuthError(err.message); }
    finally { setAuthLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        {isLoggedIn ? (
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-accent to-secondary mx-auto mb-4 text-lg font-semibold text-white">
              {user!.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">{user!.name}</h3>
            <p className="text-sm text-slate-400 mb-4">{user!.email}</p>
            <span className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-sm text-emerald-400 inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Authenticated</span>
            <button onClick={logout} className="mt-4 w-full rounded-xl border border-white/10 py-2 text-sm text-danger hover:bg-white/[0.03] transition-colors">Sign out</button>
          </div>
        ) : (
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-2 mb-5">
              <button onClick={() => setAuthTab('login')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${authTab === 'login' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}`}>Sign in</button>
              <button onClick={() => setAuthTab('signup')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${authTab === 'signup' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}`}>Create account</button>
            </div>
            {authError && <div className="mb-4 rounded-xl bg-danger/10 border border-danger/20 px-4 py-2 text-sm text-danger">{authError}</div>}
            {authTab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <p className="text-sm text-slate-500 mb-4">Sign in to manage API keys, team members, and more.</p>
                <div><label className="block text-sm text-slate-400 mb-1.5">Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" /><input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50" required /></div></div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" /><input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50" required /></div></div>
                <button type="submit" disabled={authLoading} className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"><LogIn className="h-4 w-4" /> {authLoading ? 'Signing in…' : 'Sign in'}</button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <p className="text-sm text-slate-500 mb-4">Create a free account to save experiments and manage your team.</p>
                <div><label className="block text-sm text-slate-400 mb-1.5">Name</label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" /><input type="text" value={signupName} onChange={e => setSignupName(e.target.value)} placeholder="Your name" className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50" required /></div></div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" /><input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50" required /></div></div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" /><input type="password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50" required minLength={6} /></div></div>
                <button type="submit" disabled={authLoading} className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"><UserPlus className="h-4 w-4" /> {authLoading ? 'Creating account…' : 'Create account'}</button>
              </form>
            )}
          </div>
        )}

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">API keys</h3>
            <button onClick={handleCreateKey} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50" disabled={!isLoggedIn}><KeyRound className="h-3.5 w-3.5" /> New</button>
          </div>
          {!isLoggedIn ? <div className="py-6 text-center text-sm text-slate-500">Sign in to manage API keys</div> : keysLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
          ) : apiKeys.length === 0 ? (
            <div className="py-6 text-center text-sm text-slate-500">No API keys yet. Create one to get started.</div>
          ) : (
            <div className="space-y-2">
              {apiKeys.map((ak: any) => (
                <div key={ak.id} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-white">{ak.name}</p>
                    <div className="flex items-center gap-1">
                      <button onClick={() => copyKey(ak.key || ak.key_prefix, ak.id)} className="p-1 rounded-lg hover:bg-white/[0.05] text-slate-400 hover:text-white">
                        {copiedKey === ak.id ? <CheckCheck className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={() => setShowKey(showKey === ak.id ? null : ak.id)} className="p-1 rounded-lg hover:bg-white/[0.05] text-slate-400 hover:text-white">
                        {showKey === ak.id ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={() => handleDeleteKey(ak.id)} className="p-1 rounded-lg hover:bg-white/[0.05] text-slate-400 hover:text-danger"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-mono text-slate-500">{showKey === ak.id ? (ak.key || ak.key_prefix) : `${ak.key_prefix || ''}••••••••`}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${ak.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{ak.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Team members</h3>
          <button className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium ${isLoggedIn ? 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90' : 'bg-white/5 text-slate-500 cursor-not-allowed'}`} disabled={!isLoggedIn}><Plus className="h-3.5 w-3.5" /> Invite</button>
        </div>
        {!isLoggedIn ? <div className="py-6 text-center text-sm text-slate-500">Sign in to manage team members</div> : teams.length === 0 ? (
          <div className="py-6 text-center text-sm text-slate-500">No teams yet. Create one to collaborate.</div>
        ) : (
          <div className="space-y-2">
            {teams.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-9 w-9 rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-semibold text-white">{t.name?.charAt(0)?.toUpperCase()}</div>
                  <div><p className="text-sm font-medium text-white">{t.name}</p><p className="text-xs text-slate-500">{t.member_count || 0} members · {t.plan || 'free'}</p></div>
                </div>
                <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[11px] font-medium text-accent">{t.slug}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Active sessions</h3>
          {!isLoggedIn ? <div className="py-6 text-center text-sm text-slate-500">Sign in to view sessions</div> : (
            <div className="py-6 text-center text-sm text-slate-500">Session management coming soon.</div>
          )}
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Auth log</h3>
          <div className="py-6 text-center text-sm text-slate-500">Audit trail available in Admin tab.</div>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Security settings</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { label: 'Multi-factor authentication', desc: 'Require MFA for all team members', enabled: true },
            { label: 'Session timeout', desc: 'Auto-logout after 24 hours', enabled: true },
            { label: 'Password policy', desc: 'Min 8 chars, 1 uppercase, 1 special', enabled: true },
            { label: 'SSO / OIDC', desc: 'Single sign-on integration', enabled: false },
            { label: 'IP allowlist', desc: 'Restrict to trusted IPs', enabled: false },
            { label: 'Rate limiting', desc: 'Max 5 failed attempts before lockout', enabled: true },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="min-w-0"><p className="text-sm font-medium text-white">{s.label}</p><p className="text-xs text-slate-500 truncate">{s.desc}</p></div>
              <div className={`h-6 w-10 rounded-full shrink-0 ${s.enabled ? 'bg-primary' : 'bg-white/10'} relative cursor-pointer`}>
                <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${s.enabled ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BillingTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold text-white mb-2">Current plan</h3>
        <p className="text-sm text-slate-400 mb-4">You are on the <strong className="text-white">Free</strong> plan</p>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-center justify-between">
          <div><p className="text-sm font-medium text-white">Free Plan</p><p className="text-xs text-slate-500">5 models · 1 user · Community support</p></div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary font-medium">Active</span>
        </div>
        <button className="mt-4 rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity">Upgrade to Pro</button>
      </div>
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Billing history</h3>
        <p className="text-sm text-slate-500">No invoices yet.</p>
      </div>
    </div>
  );
}

function AdminTab() {
  const [experiments, setExperiments] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    api.experiments.list().then(r => setExperiments(r.experiments)).catch(() => {});
    api.activity.list().then(r => setActivities(r.activities)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">System overview</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-xs text-slate-400">Total experiments</p>
            <p className="text-lg font-semibold text-white">{experiments.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-xs text-slate-400">Successful runs</p>
            <p className="text-lg font-semibold text-white">{experiments.filter(e => e.status === 'success').length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-xs text-slate-400">Audit events</p>
            <p className="text-lg font-semibold text-white">{activities.length}</p>
          </div>
        </div>
      </div>
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Activity log</h3>
        {activities.length === 0 ? (
          <p className="text-sm text-slate-500">No activity recorded yet.</p>
        ) : (
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {activities.map((a: any) => (
              <div key={a.id} className="flex items-start gap-3 rounded-xl px-3 py-2 hover:bg-white/[0.02]">
                <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${a.status === 'success' ? 'bg-emerald-500' : a.status === 'failed' ? 'bg-danger' : 'bg-yellow-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-zinc-300 truncate">{a.action}</p>
                    <span className="text-[10px] text-slate-600 shrink-0">{a.time ? new Date(a.time).toLocaleString() : ''}</span>
                  </div>
                  <p className="text-xs text-slate-600 truncate">{a.actor} · {a.target || ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsPage() {
  const { settingsTab, setSettingsTab } = useUIStore();

  return (
    <div className="flex gap-6 p-4 md:p-6">
      <nav className="hidden md:flex flex-col shrink-0 w-56 space-y-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = settingsTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setSettingsTab(tab.id)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors text-left ${isActive ? 'bg-white/[0.06] text-white' : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'}`}>
              <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-slate-500'}`} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 md:hidden">
          {TABS.map((tab, i) => (
            <span key={tab.id} className="flex items-center gap-2">
              <button onClick={() => setSettingsTab(tab.id)} className={settingsTab === tab.id ? 'text-white' : 'hover:text-white'}>{tab.label}</button>
              {i < TABS.length - 1 && <ChevronRight className="h-3 w-3" />}
            </span>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={settingsTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
            {settingsTab === 'general' && <GeneralTab />}
            {settingsTab === 'authentication' && <AuthenticationTab />}
            {settingsTab === 'billing' && <BillingTab />}
            {settingsTab === 'admin' && <AdminTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default SettingsPage;