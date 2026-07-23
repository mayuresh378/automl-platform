import { useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { Activity, Loader2, AlertTriangle, Copy, Check, Terminal } from 'lucide-react';
import styles from './QueryPlanView.module.css';
import { sqlService } from '../services/sqlEditor.service';
import { QueryPlan } from '../types';

interface QueryPlanViewProps {
  query: string;
  dataset?: string;
}

export const QueryPlanView = memo(function QueryPlanView({ query, dataset }: QueryPlanViewProps) {
  const [plan, setPlan] = useState<QueryPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleExplain = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await sqlService.explainQuery(query, dataset);
      setPlan(data);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }, [query, dataset]);

  const handleCopy = useCallback(async () => {
    if (!plan) return;
    try {
      await navigator.clipboard.writeText(plan.plan.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [plan]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Activity className={styles.headerIcon} />
        <span className={styles.headerText}>Execution Plan</span>
        <button onClick={handleExplain} disabled={loading || !query.trim()} className={styles.explainBtn}>
          {loading ? <Loader2 className={styles.btnSpinner} /> : <Activity className={styles.btnIcon} />}
          {loading ? 'Analyzing...' : 'Explain'}
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          <AlertTriangle className={styles.errorIcon} />
          {error}
        </div>
      )}

      {plan && (
        <div className={styles.planContainer}>
          <div className={styles.planHeader}>
            <Terminal className={styles.planIcon} />
            <span>Query Execution Plan</span>
            <button onClick={handleCopy} className={styles.copyBtn}>
              {copied ? <Check className={styles.copyIcon} /> : <Copy className={styles.copyIcon} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className={styles.planBody}>
            {plan.plan.map((line, i) => (
              <div key={i} className={styles.planLine}>
                <span className={styles.lineNum}>{i + 1}</span>
                <span className={styles.lineContent}>{line}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!plan && !loading && !error && (
        <div className={styles.emptyState}>
          <Activity className={styles.emptyIcon} />
          <p className={styles.emptyText}>Click "Explain" to view the query execution plan</p>
          <p className={styles.emptySubtext}>See how DuckDB processes your query and identify optimization opportunities</p>
        </div>
      )}
    </div>
  );
});
