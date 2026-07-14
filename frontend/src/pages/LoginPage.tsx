import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, LogIn } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { api } from '../lib/api';
import { Button } from '../components/Button';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const setActivePage = useUIStore((s) => s.setActivePage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.auth.login(email, password);
      setAuth(res.token, res.user, res.refresh_token);
      setActivePage('Dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent">
              <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-semibold text-white">AutoML Studio</span>
          </div>

          <h2 className="text-xl font-semibold text-white mb-1">Welcome back</h2>
          <p className="text-sm text-slate-400 mb-6">Sign in to your account</p>

          {error && (
            <div className="mb-4 rounded-xl bg-danger/10 border border-danger/20 px-4 py-2 text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setActivePage('Forgot Password')} type="button" className="btn-press text-xs text-slate-500 hover:text-primary transition-colors">
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              loadingText="Signing in…"
              variant="primary"
              className="w-full"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Button>
          </form>

          <div className="mt-5 relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-[#111827] px-2 text-slate-500">or continue with</span></div>
          </div>

          <button
            onClick={() => { setActivePage('Login'); /* placeholder for Google OAuth */ }}
            className="btn-press mt-4 w-full flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/10 transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <button onClick={() => setActivePage('Sign Up')} className="btn-press text-primary hover:underline">
              Sign up
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;
