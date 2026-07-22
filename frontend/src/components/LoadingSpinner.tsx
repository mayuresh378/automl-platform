import styles from './LoadingSpinner.module.css';

interface Props {
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingSpinner({ size = 'md' }: Props) {
  return (
    <div className={`${styles.wrapper} ${styles[size]}`}>
      <div className={styles.spinner} />
    </div>
  );
}
