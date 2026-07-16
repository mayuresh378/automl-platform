import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, icon, iconRight, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-zinc-300">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded bg-card border border-border px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-500 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50',
              'hover:border-primary/30',
              error && 'border-danger/50 focus:ring-danger/50 focus:border-danger animate-shake',
              icon ? 'pl-10' : '',
              iconRight ? 'pr-10' : '',
              className,
            )}
            {...props}
          />
          {iconRight && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500">
              {iconRight}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {helperText && !error && <p className="text-xs text-zinc-500">{helperText}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
