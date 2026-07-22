import type { ReactNode } from 'react';
import styles from './Card.module.css';

interface Props {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'glass';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
  hover?: boolean;
}

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  hover,
}: Props) {
  return (
    <div
      className={`${styles.card} ${styles[variant]} ${styles[`pad-${padding}`]} ${hover ? styles.hover : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`${styles.header} ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h3 className={`${styles.title} ${className}`}>{children}</h3>;
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`${styles.content} ${className}`}>{children}</div>;
}
