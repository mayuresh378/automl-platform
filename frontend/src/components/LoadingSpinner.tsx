import { motion } from 'framer-motion';
import { cn } from '../lib/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'premium' | 'pulse';
  label?: string;
  className?: string;
}

const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };

export function LoadingSpinner({ size = 'md', variant = 'default', label, className }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className="relative flex items-center justify-center">
        <svg className={cn('animate-spin', sizes[size])} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" className="text-white/10" />
          <path
            d="M12 2a10 10 0 0 1 10 10"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            className={variant === 'premium' ? 'text-primary' : variant === 'pulse' ? 'text-accent' : 'text-primary'}
          />
        </svg>
        {variant === 'pulse' && (
          <motion.span
            className="absolute block rounded-full border-2 border-accent/30"
            style={{ width: '0', height: '0' }}
            animate={{ width: ['0%', '150%'], height: ['0%', '150%'], opacity: [0.5, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
      </div>
      {label && (
        <motion.p
          className="text-xs text-zinc-500"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {label}
        </motion.p>
      )}
    </div>
  );
}

export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoadingSpinner size="lg" variant="premium" label={label} />
    </div>
  );
}
