import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/cn';
import { useRipple } from '../hooks/useRipple';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const variantStyles = {
  primary:
    'bg-gradient-to-r from-primary to-secondary text-white shadow-glow-sm hover:shadow-glow',
  secondary:
    'border border-border bg-white/[0.02] text-zinc-300 hover:border-border-strong hover:text-white',
  ghost: 'text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200',
  danger:
    'bg-gradient-to-r from-red-500 to-red-600 text-white',
  success:
    'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white',
};

const variantGlow = {
  primary: 'rgba(99,102,241,0.4)',
  secondary: 'rgba(255,255,255,0.15)',
  ghost: 'rgba(255,255,255,0.08)',
  danger: 'rgba(239,68,68,0.4)',
  success: 'rgba(34,197,94,0.4)',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-6 py-2.5 text-sm rounded-xl gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      onClick,
      variant = 'primary',
      size = 'md',
      className,
      disabled,
      loading,
      loadingText,
      icon,
      iconPosition = 'left',
      type = 'button',
      ...rest
    },
    ref,
  ) => {
    const { createRipple, rippleElements } = useRipple(variantGlow[variant]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      createRipple(e);
      onClick?.(e as any);
    };

    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        type={type}
        onClick={handleClick}
        disabled={isDisabled}
        whileHover={isDisabled ? undefined : { scale: 1.02, y: -1 }}
        whileTap={isDisabled ? undefined : { scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={cn(
          'relative overflow-hidden inline-flex items-center justify-center font-medium transition-colors cursor-pointer select-none',
          variantStyles[variant],
          sizeStyles[size],
          isDisabled && 'opacity-50 cursor-not-allowed',
          className,
        )}
        {...rest}
      >
        {rippleElements}
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            {loadingText || children}
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <motion.span
                className="shrink-0 inline-flex"
                whileHover={{ x: 2 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {icon}
              </motion.span>
            )}
            <span className="relative">{children}</span>
            {icon && iconPosition === 'right' && (
              <motion.span
                className="shrink-0 inline-flex"
                whileHover={{ x: 2 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {icon}
              </motion.span>
            )}
          </>
        )}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
