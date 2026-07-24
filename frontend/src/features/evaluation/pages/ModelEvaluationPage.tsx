import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle, Loader2, BarChart3, Target, TrendingUp,
  GitBranch, Sliders, Lightbulb, Activity, PieChart,
} from 'lucide-react';
import {
  evaluationService,
  type ComprehensiveEvaluation,
} from '../services/evaluation.service';
import { ConfusionMatrix } from '../explain/components/ConfusionMatrix';
import { RocCurve } from '../explain/components/RocCurve';
import { PrecisionRecallCurve } from '../explain/components/PrecisionRecallCurve';
import { FeatureImportanceChart } from '../explain/components/FeatureImportanceChart';
import { LearningCurve } from './components/LearningCurve';
import { ValidationCurve } from './components/ValidationCurve';
import { ResidualPlot } from './components/ResidualPlot';
import { PredictionDistribution } from './components/PredictionDistribution';
import styles from './ModelEvaluationPage.module.css';

type TabId = 'confusion' | 'roc' | 'pr' | 'learning' | 'validation' | 'importance' | 'residual' | 'distribution';

const TABS: { id: TabId; label: string; icon: typeof Target }[] = [
  { id: 'confusion', label: 'Confusion Matrix', icon: Target },
  { id: 'roc', label: 'ROC Curve', icon: TrendingUp },
  { id: 'pr', label: 'PR Curve', icon: GitBranch },
  { id: 'learning', label: 'Learning Curve', icon: BarChart3 },
  { id: 'validation', label: 'Validation Curve', icon: Sliders },
  { id: 'importance', label: 'Feature Importance', icon: Lightbulb },
  { id: 'residual', label: 'Residual Plot', icon: Activity },
  { id: 'distribution', label: 'Prediction Dist.', icon: PieChart },
];

export default function ModelEvaluationPage() {
  const [modelName, setModelName] = useState('');
  const [fileName, setFileName] = useState('');
  const [targetColumn, setTargetColumn] = useState('');
  const [result, setResult] = useState<ComprehensiveEvaluation | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('confusion');

  const evaluateMutation = useMutation({
    mutationFn: () => evaluationService.comprehensive(modelName, fileName, targetColumn),
    onSuccess: (data) => setResult(data),
  });

  const handleEvaluate = () => {
    if (!modelName.trim() || !fileName.trim() || !targetColumn.trim()) return;
    evaluateMutation.mutate();
  };

  return (
    <div className={styles.page}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Model Evaluation</h1>
            <p className={styles.subtitle}>
              Comprehensive model evaluation with 8 visualizations — confusion matrix, ROC, PR, learning curve, validation curve, feature importance, residual plot, and prediction distribution
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
                placeholder="e.g. iris_SVR.pkl"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Dataset File</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. iris.csv"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Target Column</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. sepal_length"
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
                <BarChart3 size={16} />
              )}
              Evaluate Model
            </button>
          </div>

          {evaluateMutation.isError && (
            <div className={styles.errorBanner}>
              <AlertCircle size={16} />
              <span>{(evaluateMutation.error as Error)?.message || 'Evaluation failed'}</span>
            </div>
          )}
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
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

            <div className={styles.tabsBar}>
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={15} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className={styles.tabContent}
              >
                {activeTab === 'confusion' && (
                  result.confusion_matrix
                    ? <ConfusionMatrix data={result.confusion_matrix} />
                    : <div className={styles.emptyTab}>Confusion matrix not available for regression tasks</div>
                )}
                {activeTab === 'roc' && (
                  result.roc_curve
                    ? <RocCurve data={result.roc_curve} />
                    : <div className={styles.emptyTab}>ROC curve not available — model needs predict_proba support</div>
                )}
                {activeTab === 'pr' && (
                  result.pr_curve
                    ? <PrecisionRecallCurve data={result.pr_curve} />
                    : <div className={styles.emptyTab}>PR curve not available — model needs predict_proba support</div>
                )}
                {activeTab === 'learning' && <LearningCurve data={result.learning_curve} />}
                {activeTab === 'validation' && <ValidationCurve data={result.validation_curve} />}
                {activeTab === 'importance' && (
                  result.feature_importance.length > 0
                    ? <FeatureImportanceChart data={result.feature_importance} />
                    : <div className={styles.emptyTab}>Feature importance not available for this model type</div>
                )}
                {activeTab === 'residual' && (
                  result.residual_plot
                    ? <ResidualPlot data={result.residual_plot} />
                    : <div className={styles.emptyTab}>Residual plot only available for regression tasks</div>
                )}
                {activeTab === 'distribution' && <PredictionDistribution data={result.prediction_distribution} />}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {!result && !evaluateMutation.isPending && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <BarChart3 size={32} />
            </div>
            <h3 className={styles.emptyTitle}>Enter a model and dataset to evaluate</h3>
            <p className={styles.emptyDesc}>
              Provide a trained model file, dataset, and target column to generate comprehensive evaluation visualizations
            </p>
            <div className={styles.vizGrid}>
              <div className={styles.vizCard}><Target size={16} /><span>Confusion Matrix</span></div>
              <div className={styles.vizCard}><TrendingUp size={16} /><span>ROC Curve</span></div>
              <div className={styles.vizCard}><GitBranch size={16} /><span>PR Curve</span></div>
              <div className={styles.vizCard}><BarChart3 size={16} /><span>Learning Curve</span></div>
              <div className={styles.vizCard}><Sliders size={16} /><span>Validation Curve</span></div>
              <div className={styles.vizCard}><Lightbulb size={16} /><span>Feature Importance</span></div>
              <div className={styles.vizCard}><Activity size={16} /><span>Residual Plot</span></div>
              <div className={styles.vizCard}><PieChart size={16} /><span>Prediction Dist.</span></div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
