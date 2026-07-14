import { useState } from 'react';
import { useUIStore } from '../../../store/useUIStore';
import { useLogin } from '../hooks/useLogin';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardHeader, CardTitle } from '../../../components/ui/Card';
import { PageContainer } from '../../../components/layout/PageContainer';
import { ErrorState } from '../../../components/ui/ErrorState';
import { motion } from 'framer-motion';
import { LogIn, Brain, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { loginSchema } from '../../../lib/validators';
import { useNotification } from '../../../hooks/useNotification';
import { getErrorMessage } from '../../../services/http';

export default function LoginPage() {
  const setActivePage = useUIStore((s) => s.setActivePage);
  const login = useLogin();
  const { notifyError } = useNotification();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((e) => {
        fieldErrors[e.path[0] as string] = e.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    login.mutate(
      { email, password },
      {
        onSuccess: () => setActivePage('Dashboard'),
        onError: (err) => notifyError('Login failed', getErrorMessage(err)),
      },
    );
  };

  if (login.isError && !login.isPending) {
    return (
      <PageContainer maxWidth="sm">
        <ErrorState
          title="Login Failed"
          message={getErrorMessage(login.error)}
          onRetry={() => login.reset()}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="sm">
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <Card variant="glass" padding="lg" className="w-full">
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                <Brain className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-zinc-100">Welcome back</h1>
              <p className="text-sm text-zinc-400 mt-1">Sign in to your AutoML account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                placeholder="you@example.com"
                icon={<MailIcon />}
                autoComplete="email"
              />
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                placeholder="Enter your password"
                icon={<LockIcon />}
                iconRight={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                autoComplete="current-password"
              />

              {login.error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{getErrorMessage(login.error)}</span>
                </div>
              )}

              <Button type="submit" loading={login.isPending} className="w-full" size="lg" icon={<LogIn className="w-4 h-4" />}>
                Sign In
              </Button>
            </form>

            <div className="mt-6 flex flex-col items-center gap-3 text-sm">
              <button onClick={() => setActivePage('Forgot Password')} className="text-zinc-500 hover:text-primary transition-colors">
                Forgot your password?
              </button>
              <div className="text-zinc-500">
                Don't have an account?{' '}
                <button onClick={() => setActivePage('Register')} className="text-primary hover:text-primary/80 transition-colors font-medium">
                  Create one
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </PageContainer>
  );
}

function MailIcon() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>; }
function LockIcon() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>; }
