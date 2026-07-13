import { motion } from 'framer-motion';
import { cn } from '../lib/cn';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'primary' | 'accent' | 'none';
  hoverLift?: boolean;
  as?: 'div' | 'section' | 'article';
  index?: number;
  onClick?: () => void;
}

const glowStyles = {
  primary: 'hover:shadow-[0_0_0_1px_rgba(99,102,241,0.15),0_12px_40px_rgba(99,102,241,0.12)]',
  accent: 'hover:shadow-[0_0_0_1px_rgba(6,182,212,0.15),0_12px_40px_rgba(6,182,212,0.12)]',
  none: '',
};

export function AnimatedCard({
  children,
  className,
  glow = 'primary',
  hoverLift = true,
  as: Tag = 'div',
  index = 0,
  onClick,
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: 'easeOut' }}
      whileHover={hoverLift ? { y: -2, transition: { duration: 0.2 } } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      onClick={onClick}
      className={cn(
        'transition-shadow duration-300',
        glow !== 'none' && glowStyles[glow],
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
