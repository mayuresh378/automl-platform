import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { useUIStore } from '../store/useUIStore';
import { useAuthStore } from '../store/useAuthStore';

function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [msg, setMsg] = useState('');
  const setActivePage = useUIStore(s => s.setActivePage);
  const setUser = useAuthStore(s => s.setUser);
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      setStatus('error');
      setMsg('No verification token provided');
      return;
    }
    api.auth.verifyEmail(token)
      .then(() => {
        setStatus('success');
        setMsg('Email verified successfully!');
        if (user) setUser({ ...user, email_verified: true });
      })
      .catch((e) => {
        setStatus('error');
        setMsg(e.message || 'Verification failed');
      });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-8 w-full max-w-md text-center">
        {status === 'loading' && (
          <div>
            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-400">Verifying your email...</p>
          </div>
        )}
        {status === 'success' && (
          <div>
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-white mb-2">{msg}</h2>
            <button onClick={() => setActivePage('Dashboard')} className="btn-press mt-4 rounded-2xl bg-primary/20 px-6 py-2 text-sm text-primary hover:bg-primary/30 transition-colors">
              Go to Dashboard
            </button>
          </div>
        )}
        {status === 'error' && (
          <div>
            <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-white mb-2">Verification failed</h2>
            <p className="text-sm text-slate-400 mb-4">{msg}</p>
            <button onClick={() => setActivePage('Login')} className="btn-press text-sm text-primary hover:text-primary/80">
              Back to login
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default VerifyEmailPage;
