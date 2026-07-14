import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Smartphone, LogOut, Trash2, CheckCircle2, XCircle, Loader2, Lock, Bell, Moon, Sun, Save, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { staggerContainer, staggerItem } from '../lib/animations';

function ProfilePage() {
  const { user, setUser, logout: storeLogout, token } = useAuthStore();
  const setActivePage = useUIStore(s => s.setActivePage);

  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const [cpw, setCpw] = useState('');
  const [npw, setNpw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState('');

  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const [sendingVerification, setSendingVerification] = useState(false);
  const [vMsg, setVMsg] = useState('');

  useEffect(() => {
    setSessionsLoading(true);
    api.auth.sessions().then(r => setSessions(r.sessions)).catch(() => {}).finally(() => setSessionsLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setMsg('');
    try {
      const res = await api.auth.updateProfile({ name: name.trim() });
      setUser({ ...user!, ...res });
      setMsg('Profile updated');
    } catch (e: any) {
      setMsg(e.message || 'Failed to update');
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!cpw || !npw) return;
    setChangingPw(true);
    setPwMsg('');
    try {
      await api.auth.changePassword(cpw, npw);
      setPwMsg('Password changed successfully');
      setCpw('');
      setNpw('');
    } catch (e: any) {
      setPwMsg(e.message || 'Failed to change password');
    }
    setChangingPw(false);
  };

  const handleVerifyEmail = async () => {
    setSendingVerification(true);
    setVMsg('');
    try {
      await api.auth.sendVerification();
      setVMsg('Verification email sent');
    } catch (e: any) {
      setVMsg(e.message || 'Failed to send');
    }
    setSendingVerification(false);
  };

  const handleRevoke = async (id: string) => {
    try {
      await api.auth.revokeSession(id);
      setSessions(sessions.map(s => s.id === id ? { ...s, is_active: false } : s));
    } catch {}
  };

  const handleLogout = async () => {
    await api.auth.logout();
    storeLogout();
    setActivePage('Dashboard');
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 p-6 max-w-4xl">
      <div>
        <p className="text-sm text-slate-400">Account settings</p>
        <h1 className="text-2xl font-semibold text-white">Profile & security</h1>
      </div>

      <motion.div variants={staggerItem} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl font-bold text-white">
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{user?.name}</h3>
            <p className="text-sm text-slate-400 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> {user?.email}
              {user?.email_verified ? (
                <span className="flex items-center gap-0.5 text-emerald-400 text-xs"><CheckCircle2 className="h-3 w-3" /> Verified</span>
              ) : (
                <span className="flex items-center gap-0.5 text-amber-400 text-xs"><AlertCircle className="h-3 w-3" /> Unverified</span>
              )}
            </p>
            <p className="text-xs text-slate-600 capitalize">Role: {user?.role || 'member'}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Display name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-primary/40" />
            <button onClick={handleSaveProfile} disabled={saving}
              className="btn-press mt-2 flex items-center gap-1.5 rounded-2xl bg-primary/20 px-4 py-2 text-sm text-primary hover:bg-primary/30 transition-colors">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
            </button>
            {msg && <p className="text-xs text-emerald-400 mt-1">{msg}</p>}
          </div>

          {!user?.email_verified && (
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
              <p className="text-sm text-amber-400 font-medium mb-1">Email not verified</p>
              <p className="text-xs text-slate-400 mb-2">Verify your email to enable all features.</p>
              <button onClick={handleVerifyEmail} disabled={sendingVerification}
                className="btn-press text-xs text-primary hover:text-primary/80">
                {sendingVerification ? 'Sending...' : 'Send verification email'}
              </button>
              {vMsg && <p className="text-xs text-emerald-400 mt-1">{vMsg}</p>}
            </div>
          )}
        </div>
      </motion.div>

      <motion.div variants={staggerItem} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-white">Change password</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="relative">
            <label className="text-sm text-slate-400 mb-1 block">Current password</label>
            <input type={showPw ? 'text' : 'password'} value={cpw} onChange={e => setCpw(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 pr-10 text-sm text-white outline-none focus:border-primary/40" />
          </div>
          <div className="relative">
            <label className="text-sm text-slate-400 mb-1 block">New password</label>
            <input type={showPw ? 'text' : 'password'} value={npw} onChange={e => setNpw(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 pr-10 text-sm text-white outline-none focus:border-primary/40" />
            <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-8 text-slate-500 hover:text-white">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <button onClick={handleChangePassword} disabled={changingPw || !cpw || !npw}
          className="btn-press mt-3 flex items-center gap-1.5 rounded-2xl bg-primary/20 px-4 py-2 text-sm text-primary hover:bg-primary/30 transition-colors disabled:opacity-40">
          {changingPw ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />} Change password
        </button>
        {pwMsg && <p className={`text-xs mt-1 ${pwMsg.includes('success') ? 'text-emerald-400' : 'text-red-400'}`}>{pwMsg}</p>}
      </motion.div>

      <motion.div variants={staggerItem} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-white">Active sessions</h3>
        </div>
        {sessionsLoading ? (
          <div className="py-8 text-center"><Loader2 className="h-5 w-5 animate-spin text-slate-400 mx-auto" /></div>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-slate-500">No active sessions</p>
        ) : (
          <div className="space-y-2">
            {sessions.map(s => (
              <div key={s.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center gap-2">
                  {s.is_active ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-slate-600" />}
                  <div>
                    <p className="text-sm text-white">{s.device_info || 'Unknown device'}</p>
                    <p className="text-xs text-slate-500">{s.ip_address ? `IP: ${s.ip_address}` : ''} {s.last_used_at ? `· ${new Date(s.last_used_at).toLocaleString()}` : ''}</p>
                  </div>
                </div>
                {s.is_active && (
                  <button onClick={() => handleRevoke(s.id)} className="btn-press text-red-400 hover:text-red-300">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div variants={staggerItem} className="flex items-center justify-between card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="flex items-center gap-2">
          <LogOut className="h-5 w-5 text-red-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">Sign out</h3>
            <p className="text-xs text-slate-500">End this session and return to login</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-press rounded-2xl bg-red-500/10 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 transition-colors">
          Logout
        </button>
      </motion.div>
    </motion.div>
  );
}

export default ProfilePage;
