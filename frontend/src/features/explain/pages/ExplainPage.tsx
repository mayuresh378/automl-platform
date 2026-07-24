import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Brain, Search, FileText, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { explainService, type ModelEvaluation } from '../services/explain.service';
import { FeatureImportanceChart } from '../components/FeatureImportanceChart';
import { ShapWaterfall } from '../components/ShapWaterfall';
import { ConfusionMatrix } from '../components/ConfusionMatrix';
import { RocCurve } from '../components/RocCurve';
import { PrecisionRecallCurve } from '../components/PrecisionRecallCurve';
import { PredictionPreviewTable } from '../components/PredictionPreview';
import styles from './ExplainPage.module.css';

export default function ExplainPage() {
  const [modelName, setModelName] = useState('');
  const [fileName, setFileName] = useState('');
  const [targetColumn, setTargetColumn] = useState('');
  const [result, setResult] = useState<ModelEvaluation | null>(null);

  const evaluateMutation = useMutation({
    mutationFn: () => explainService.evaluate(modelName, fileName, targetColumn),
    onSuccess: (data) => setResult(data),
  });

  const handleEvaluate = () => {
    if (!modelName.trim() || !fileName.trim() || !targetColumn.trim()) return;
    evaluateMutation.mutate();
  };

  return (
    <div className={styles.page}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Explainable AI</h1>
            <p className={styles.subtitle}>
              Understand your model with feature importance, SHAP values, confusion matrix, ROC & PR curves
            </p>
          </div>
        </div>

        <div className={styles.inputCard}>
          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Model File (.pkl)</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. annual-enterprise-survey-2025_RandomForest.pkl"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Dataset File</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. annual-enterprise-survey-2025.csv"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Target Column</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. cogs_usd"
                value={targetColumn}
                onChange={(e) => setTargetColumn(e.target.value)}
              />
            </div>
            <button
              className={styles.evalBtn}
              onClick={handleEvaluate}
              disabled={evaluateMutation.isPending || !modelName.trim() || !fileName.trim() || !targetColumn.trim()}
            >
              {evaluateMutation.isPending ? (
                <Loader2 size={16} className={styles.spin} />
              ) : (
                <Sparkles size={16} />
              )}
              Evaluate
            </button>
          </div>

          {evaluateMutation.isError && (
            <div className={styles.errorBanner}>
              <AlertCircle size={16} />
              <span>{evaluateMutation.error?.message || 'Evaluation failed'}</span>
            </div>
          )}
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={styles.results}
          >
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Task Type</span>
                <span className={styles.statValue}>{result.task_type}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Features</span>
                <span className={styles.statValue}>{result.feature_names.length}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Train Size</span>
                <span className={styles.statValue}>{result.train_size.toLocaleString()}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Test Size</span>
                <span className={styles.statValue}>{result.test_size.toLocaleString()}</span>
              </div>
              {result.roc_curve?.auc != null && (
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>AUC</span>
                  <span className={`${styles.statValue} ${styles.aucHighlight}`}>{result.roc_curve.auc.toFixed(4)}</span>
                </div>
              )}
              {result.roc_curve?.macro_auc != null && (
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Macro AUC</span>
                  <span className={`${styles.statValue} ${styles.aucHighlight}`}>{result.roc_curve.macro_auc.toFixed(4)}</span>
                </div>
              )}
            </div>

            <div className={styles.twoCol}>
              <FeatureImportanceChart data={result.feature_importance} />
              <ShapWaterfall data={result.shap_values} />
            </div>

            {result.confusion_matrix && (
              <ConfusionMatrix data={result.confusion_matrix} />
            )}

            <div className={styles.twoCol}>
              <RocCurve data={result.roc_curve!} />
              <PrecisionRecallCurve data={result.pr_curve!} />
            </div>

            {result.prediction_preview && result.prediction_preview.length > 0 && (
              <PredictionPreviewTable data={result.prediction_preview} />
            )}
          </motion.div>
        )}

        {!result && !evaluateMutation.isPending && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Brain size={32} />
            </div>
            <h3 className={styles.emptyTitle}>Enter a model and dataset to begin</h3>
            <p className={styles.emptyDesc}>
              Provide a trained model file, dataset, and target column to generate explanations
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
