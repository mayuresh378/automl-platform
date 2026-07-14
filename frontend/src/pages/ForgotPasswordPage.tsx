import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useUIStore } from '../store/useUIStore';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setActivePage = useUIStore(s => s.setActivePage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      await api.auth.forgotPassword(email.trim());
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
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
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-white">Forgot password?</h2>
            <p className="mt-1 text-sm text-slate-400">Enter your email and we'll send you a reset link.</p>
          </div>

          {sent ? (
            <div className="text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
              <p className="text-sm text-slate-300">Check your email for the reset link.</p>
              <p className="text-xs text-slate-500 mt-2">If an account with that email exists, you'll receive instructions shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-primary/40"
                  placeholder="you@example.com" />
              </div>
              {error && (
                <div className="flex items-center gap-2 rounded-2xl bg-red-500/10 px-4 py-2 text-xs text-red-400">
                  <AlertCircle className="h-3.5 w-3.5" /> {error}
                </div>
              )}
              <button type="submit" disabled={loading || !email.trim()}
                className="w-full rounded-2xl bg-primary/20 py-2.5 text-sm font-medium text-primary hover:bg-primary/30 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Send reset link
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default ForgotPasswordPage;
