import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { api } from '../lib/api';
import { useUIStore } from '../store/useUIStore';

function ResetPasswordPage() {
  const [token, setToken] = useState(() => new URLSearchParams(window.location.search).get('token') || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const setActivePage = useUIStore(s => s.setActivePage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !password) return;
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    try {
      await api.auth.resetPassword(token, password);
      setDone(true);
    } catch (err: any) {
      setError(err.message || 'Reset failed. The link may have expired.');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <button onClick={() => setActivePage('Login')} className="btn-press flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </button>
        <div className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-white">Reset your password</h2>
            <p className="mt-1 text-sm text-slate-400">Enter your new password below.</p>
          </div>

          {done ? (
            <div className="text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
              <p className="text-sm text-slate-300">Password reset successful!</p>
              <button onClick={() => setActivePage('Login')} className="btn-press mt-4 rounded-2xl bg-primary/20 px-6 py-2 text-sm text-primary hover:bg-primary/30 transition-colors">
                Sign in with new password
              </button>
            </div>
          ) : !token ? (
            <div className="text-center">
              <AlertCircle className="h-10 w-10 text-amber-400 mx-auto mb-3" />
              <p className="text-sm text-slate-400">Invalid or missing reset token.</p>
              <button onClick={() => setActivePage('Forgot Password')} className="btn-press mt-4 text-sm text-primary hover:text-primary/80">
                Request a new reset link
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <label className="text-sm text-slate-400 mb-1 block">New password</label>
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 pr-10 text-sm text-white outline-none focus:border-primary/40"
                  placeholder="Min 6 characters" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-8 text-slate-500 hover:text-white">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Confirm password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-primary/40"
                  placeholder="Repeat password" />
              </div>
              {error && (
                <div className="flex items-center gap-2 rounded-2xl bg-red-500/10 px-4 py-2 text-xs text-red-400">
                  <AlertCircle className="h-3.5 w-3.5" /> {error}
                </div>
              )}
              <button type="submit" disabled={loading || !password || !confirm}
                className="w-full rounded-2xl bg-primary/20 py-2.5 text-sm font-medium text-primary hover:bg-primary/30 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Reset password
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default ResetPasswordPage;
