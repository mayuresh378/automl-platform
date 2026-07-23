import { useState, useCallback, memo } from 'react';
import {
  Sparkles, Loader2, AlertTriangle, CheckCircle, Lightbulb,
  Target, Wrench, BarChart3, ArrowRight,
} from 'lucide-react';
import styles from './AiRecommendations.module.css';
import { QueryProfile, ColumnProfile } from '../types';

interface AiRecommendationsProps {
  profile: QueryProfile | null;
  onInsertQuery: (query: string) => void;
}

interface Recommendation {
  type: 'target' | 'preprocessing' | 'feature' | 'warning' | 'tip';
  title: string;
  description: string;
  query?: string;
}

function generateRecommendations(profile: QueryProfile): Recommendation[] {
  const recs: Recommendation[] = [];
  const { columns, summary } = profile;

  const highNullCols = columns.filter((c) => c.null_pct > 30);
  if (highNullCols.length > 0) {
    recs.push({
      type: 'warning',
      title: 'High Missing Values',
      description: `${highNullCols.length} column(s) have >30% missing values: ${highNullCols.map((c) => c.name).join(', ')}. Consider dropping or imputing these columns.`,
    });
  }

  const numericCols = columns.filter((c) => c.dtype.toLowerCase().includes('int') || c.dtype.toLowerCase().includes('float') || c.dtype.toLowerCase().includes('double'));
  const catCols = columns.filter((c) => c.dtype.toLowerCase().includes('varchar') || c.dtype.toLowerCase().includes('string') || c.dtype.toLowerCase().includes('text'));

  if (numericCols.length > 0) {
    const candidates = numericCols.filter((c) => c.unique_count > 2 && c.null_pct < 50);
    if (candidates.length > 0) {
      recs.push({
        type: 'target',
        title: 'Potential Target Columns',
        description: `These numeric columns could be good prediction targets: ${candidates.slice(0, 5).map((c) => `${c.name} (${c.unique_count} unique)`).join(', ')}.`,
      });
    }
  }

  const highCardCols = columns.filter((c) => c.unique_pct > 90 && c.null_pct < 50);
  if (highCardCols.length > 0) {
    recs.push({
      type: 'feature',
      title: 'High Cardinality Columns',
      description: `${highCardCols.map((c) => c.name).join(', ')} have very high cardinality. These may need encoding (e.g., target encoding) before model training.`,
    });
  }

  if (numericCols.length > 2) {
    const names = numericCols.slice(0, 4).map((c) => c.name);
    recs.push({
      type: 'tip',
      title: 'Feature Engineering',
      description: `Consider creating interaction features from: ${names.join(', ')}. Polynomial or ratio features often improve model performance.`,
      query: `SELECT *,\n  ${names[0]} * ${names[1] || names[0]} AS ${names[0]}_x_${names[1] || names[0]}\nFROM data\nLIMIT 100;`,
    });
  }

  if (summary.total_rows > 100000) {
    recs.push({
      type: 'preprocessing',
      title: 'Large Dataset',
      description: `Your dataset has ${summary.total_rows.toLocaleString()} rows. Consider sampling for faster iteration, then train on the full dataset.`,
    });
  }

  if (summary.duplicate_rows > 0) {
    recs.push({
      type: 'warning',
      title: 'Duplicate Rows Detected',
      description: `Found ${summary.duplicate_rows.toLocaleString()} duplicate rows (${((summary.duplicate_rows / summary.total_rows) * 100).toFixed(1)}%). Remove duplicates before training.`,
      query: `SELECT DISTINCT *\nFROM data;`,
    });
  }

  const constCols = columns.filter((c) => c.unique_count <= 1);
  if (constCols.length > 0) {
    recs.push({
      type: 'warning',
      title: 'Constant Columns',
      description: `${constCols.map((c) => c.name).join(', ')} have only 1 unique value and provide no predictive power. Drop them.`,
    });
  }

  if (catCols.length > 0 && numericCols.length > 0) {
    recs.push({
      type: 'preprocessing',
      title: 'Categorical Encoding',
      description: `${catCols.length} categorical column(s) detected: ${catCols.slice(0, 5).map((c) => c.name).join(', ')}. These will need encoding (one-hot, label, or target) for model training.`,
    });
  }

  if (recs.length === 0) {
    recs.push({
      type: 'tip',
      title: 'Looking Good',
      description: 'Your data looks well-structured. Consider exploring correlations and feature importance after training a model.',
    });
  }

  return recs;
}

const TYPE_CONFIG = {
  target: { icon: Target, color: '#22c55e', label: 'Target Suggestion' },
  preprocessing: { icon: Wrench, color: '#3b82f6', label: 'Preprocessing' },
  feature: { icon: BarChart3, color: '#8b5cf6', label: 'Feature Engineering' },
  warning: { icon: AlertTriangle, color: '#f59e0b', label: 'Warning' },
  tip: { icon: Lightbulb, color: '#06b6d4', label: 'Tip' },
};

export const AiRecommendations = memo(function AiRecommendations({ profile, onInsertQuery }: AiRecommendationsProps) {
  const recs = profile ? generateRecommendations(profile) : [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Sparkles className={styles.headerIcon} />
        <span className={styles.headerText}>AI Recommendations</span>
      </div>

      {!profile ? (
        <div className={styles.emptyState}>
          <Lightbulb className={styles.emptyIcon} />
          <p className={styles.emptyText}>Run Data Profiling first to get AI recommendations</p>
        </div>
      ) : (
        <div className={styles.recList}>
          {recs.map((rec, i) => {
            const config = TYPE_CONFIG[rec.type];
            const Icon = config.icon;
            return (
              <div key={i} className={styles.recCard}>
                <div className={styles.recHeader}>
                  <Icon className={styles.recIcon} style={{ color: config.color }} />
                  <span className={styles.recType} style={{ color: config.color }}>{config.label}</span>
                </div>
                <div className={styles.recTitle}>{rec.title}</div>
                <div className={styles.recDesc}>{rec.description}</div>
                {rec.query && (
                  <button onClick={() => onInsertQuery(rec.query!)} className={styles.insertBtn}>
                    <ArrowRight className={styles.insertIcon} />
                    Use Query
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
