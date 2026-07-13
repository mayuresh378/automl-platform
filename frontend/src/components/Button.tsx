import { motion } from 'framer-motion';
import { cn } from '../lib/cn';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

const variants = {
  primary: 'bg-gradient-to-r from-primary to-secondary text-white shadow-glow-sm',
  secondary: 'border border-border bg-white/[0.02] text-zinc-300 hover:border-border-strong hover:text-white',
  ghost: 'text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200',
  danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-6 py-2.5 text-sm rounded-xl gap-2',
};

export function Button({ children, onClick, variant = 'primary', size = 'md', className, disabled, type = 'button' }: ButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className={cn(
        'inline-flex items-center font-medium transition-colors',
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      {children}
    </motion.button>
  );
}
