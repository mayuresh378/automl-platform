import { type ReactNode, type HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'glass' | 'premium' | 'gradient-border';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantStyles = {
  default: 'bg-card shadow-card',
  glass: 'glass',
  premium: 'glass',
  'gradient-border': 'bg-card shadow-card gradient-border gradient-border-subtle',
};

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ children, variant = 'default', hover = false, padding = 'md', className, ...props }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
      className={cn(
        'rounded-lg transition-all duration-300',
        variantStyles[variant],
        paddingStyles[padding],
        hover && 'card-hover',
        className,
      )}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center justify-between mb-4', className)} {...props}>{children}</div>;
}

export function CardTitle({ children, className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-base font-semibold text-zinc-200', className)} {...props}>{children}</h3>;
}

export function CardDescription({ children, className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-zinc-400', className)} {...props}>{children}</p>;
}

export function CardContent({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('', className)} {...props}>{children}</div>;
}
