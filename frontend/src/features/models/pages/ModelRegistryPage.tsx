import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Brain,
  Search,
  Plus,
  TrendingUp,
  Rocket,
  Archive,
  Clock,
  Tag,
  ChevronRight,
  Layers,
  BarChart3,
  AlertCircle,
  User,
  HardDrive,
} from 'lucide-react';
import { useModels } from '../../../hooks/useApi';
import { modelsService } from '../../../services/models.service';
import styles from './ModelRegistryPage.module.css';

type ModelStatus = 'production' | 'staging' | 'archived' | 'registered';

const statusFilters: { label: string; value: ModelStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Production', value: 'production' },
  { label: 'Staging', value: 'staging' },
  { label: 'Archived', value: 'archived' },
];

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  production: {
    bg: 'var(--color-success-bg)',
    text: 'var(--color-success)',
    border: 'var(--color-success-border)',
  },
  staging: {
    bg: 'var(--color-warning-bg)',
    text: 'var(--color-warning)',
    border: 'var(--color-warning-border)',
  },
  archived: {
    bg: 'var(--color-surface)',
    text: 'var(--color-text-tertiary)',
    border: 'var(--color-border)',
  },
  registered: {
    bg: 'var(--color-accent-bg)',
    text: 'var(--color-accent)',
    border: 'var(--color-accent-border)',
  },
};

const algorithmGradients: Record<string, string> = {
  XGBoost: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'Random Forest': 'linear-gradient(135deg, #10b981, #059669)',
  BERT: 'linear-gradient(135deg, #f59e0b, #d97706)',
  Prophet: 'linear-gradient(135deg, #3b82f6, #2563eb)',
  'ResNet-50': 'linear-gradient(135deg, #ef4444, #dc2626)',
  LightFM: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
  LSTM: 'linear-gradient(135deg, #06b6d4, #0891b2)',
  'Naive Bayes': 'linear-gradient(135deg, #64748b, #475569)',
  'Logistic Regression': 'linear-gradient(135deg, #ec4899, #db2777)',
  'LightGBM': 'linear-gradient(135deg, #14b8a6, #0d9488)',
  'CatBoost': 'linear-gradient(135deg, #a855f7, #9333ea)',
  'Decision Tree': 'linear-gradient(135deg, #f97316, #ea580c)',
  'Gradient Boosting': 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
};

const defaultGradient = 'linear-gradient(135deg, #6366f1, #8b5cf6)';

function getGradient(algorithm: string): string {
  if (algorithmGradients[algorithm]) return algorithmGradients[algorithm];
  for (const [key, value] of Object.entries(algorithmGradients)) {
    if (algorithm.toLowerCase().includes(key.toLowerCase())) return value;
  }
  return defaultGradient;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 30) return `${Math.floor(diffDays / 30)}mo ago`;
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMinutes > 0) return `${diffMinutes}m ago`;
  return 'just now';
}

export default function ModelRegistryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<ModelStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: models = [], isLoading, error } = useModels();

  const filtered = useMemo(() => {
    return models.filter((model: any) => {
      const matchesStatus =
        activeFilter === 'all' || model.status === activeFilter;
      const matchesSearch =
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (model.model_type && model.model_type.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (model.tags && model.tags.some((tag: string) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        ));
      return matchesStatus && matchesSearch;
    });
  }, [models, activeFilter, searchQuery]);

  const totalModels = models.length;
  const inProduction = models.filter((m: any) => m.status === 'production').length;
  const latestVersion = models.reduce(
    (max: string, m: any) => (m.version && m.version > max ? m.version : max),
    '0.0.0',
  );
  const avgAccuracy =
    models.length > 0
      ? models.reduce((sum: number, m: any) => sum + (m.cv_score ?? 0), 0) /
        models.length
      : 0;

  const summaryStats = [
    {
      label: 'Total Models',
      value: totalModels,
      icon: Layers,
      color: 'var(--color-secondary)',
      bg: 'rgba(79, 70, 229, 0.08)',
    },
    {
      label: 'In Production',
      value: inProduction,
      icon: Rocket,
      color: 'var(--color-success)',
      bg: 'rgba(34, 197, 94, 0.08)',
    },
    {
      label: 'Latest Version',
      value: `v${latestVersion}`,
      icon: TrendingUp,
      color: 'var(--color-accent)',
      bg: 'rgba(6, 182, 212, 0.08)',
    },
    {
      label: 'Avg Accuracy',
      value: `${(avgAccuracy * 100).toFixed(1)}%`,
      icon: BarChart3,
      color: 'var(--color-warning)',
      bg: 'rgba(245, 158, 11, 0.08)',
    },
  ];

  if (error) {
    return (
      <div className={styles.page}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Model Registry</h1>
              <p className={styles.subtitle}>
                Browse, manage, and deploy your trained models
              </p>
            </div>
          </div>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <AlertCircle size={32} />
            </div>
            <h3 className={styles.emptyTitle}>Failed to load models</h3>
            <p className={styles.emptyDesc}>
              Please check your connection and try again
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Model Registry</h1>
            <p className={styles.subtitle}>
              Browse, manage, and deploy your trained models
            </p>
          </div>
          <button
            className={styles.btnPrimary}
            onClick={() => navigate('/app/training')}
          >
            <Plus size={16} />
            Register Model
          </button>
        </div>

        <div className={styles.summaryGrid}>
          {summaryStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3, ease: 'easeOut' }}
              className={styles.summaryCard}
            >
              <div className={styles.summaryTop}>
                <div
                  className={styles.summaryIcon}
                  style={{ background: stat.bg, color: stat.color }}
                >
                  <stat.icon size={18} />
                </div>
              </div>
              <p className={styles.summaryValue}>{stat.value}</p>
              <p className={styles.summaryLabel}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className={styles.filterBar}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by name, algorithm, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.filterTabs}>
            {statusFilters.map((f) => (
              <button
                key={f.value}
                className={`${styles.filterTab} ${activeFilter === f.value ? styles.filterTabActive : ''}`}
                onClick={() => setActiveFilter(f.value)}
              >
                {f.label}
                {f.value !== 'all' && (
                  <span className={styles.filterCount}>
                    {models.filter((m: any) => m.status === f.value).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles.emptyState}
          >
            <div className={styles.emptyIcon}>
              <Brain size={32} />
            </div>
            <h3 className={styles.emptyTitle}>Loading models...</h3>
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles.emptyState}
          >
            <div className={styles.emptyIcon}>
              <Brain size={32} />
            </div>
            <h3 className={styles.emptyTitle}>No models found</h3>
            <p className={styles.emptyDesc}>
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Register your first model to get started'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
            }}
            initial="hidden"
            animate="visible"
            className={styles.modelGrid}
          >
            {filtered.map((model: any) => {
              const statusColor = statusColors[model.status] ?? statusColors.registered;
              const gradient = getGradient(model.model_type);

              return (
                <motion.div
                  key={model.id}
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
                  }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className={styles.modelCard}
                  onClick={() => navigate(`/app/models/${model.id}`)}
                >
                  <div className={styles.cardTopRow}>
                    <div className={styles.cardIcon} style={{ background: gradient }}>
                      <Brain size={20} color="#fff" />
                    </div>
                    <span
                      className={styles.statusBadge}
                      style={{
                        background: statusColor.bg,
                        color: statusColor.text,
                        borderColor: statusColor.border,
                      }}
                    >
                      {model.status}
                    </span>
                  </div>

                  <h3 className={styles.modelName}>{model.name}</h3>

                  <div className={styles.modelMeta}>
                    <span className={styles.algorithmBadge}>{model.model_type}</span>
                    <span className={styles.versionText}>v{model.version}</span>
                    {model.owner && (
                      <span className={styles.ownerBadge}>
                        <User size={10} />
                        {model.owner}
                      </span>
                    )}
                  </div>

                  <div className={styles.metricsRow}>
                    <div className={styles.metric}>
                      <span className={styles.metricLabel}>Accuracy</span>
                      <span className={styles.metricValue}>
                        {model.cv_score != null
                          ? `${(model.cv_score * 100).toFixed(1)}%`
                          : 'N/A'}
                      </span>
                    </div>
                    {model.file_size_kb != null && (
                      <>
                        <div className={styles.metricDivider} />
                        <div className={styles.metric}>
                          <span className={styles.metricLabel}>Size</span>
                          <span className={styles.metricValue}>
                            {model.file_size_kb >= 1024
                              ? `${(model.file_size_kb / 1024).toFixed(1)} MB`
                              : `${model.file_size_kb} KB`}
                          </span>
                        </div>
                      </>
                    )}
                    {model.description && (
                      <>
                        <div className={styles.metricDivider} />
                        <div className={styles.metric} style={{ maxWidth: 140 }}>
                          <span className={styles.metricLabel}>Description</span>
                          <span className={styles.metricValue} style={{ fontSize: 'var(--text-tiny)', fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {model.description}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className={styles.tagsRow}>
                    <Tag size={12} className={styles.tagIcon} />
                    {(model.tags ?? []).slice(0, 3).map((tag: string) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.footerLeft}>
                      <Clock size={12} />
                      <span>
                        {model.updated_at
                          ? formatRelativeTime(model.updated_at)
                          : model.created_at
                            ? formatRelativeTime(model.created_at)
                            : ''}
                      </span>
                    </div>
                    <div className={styles.footerRight}>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
