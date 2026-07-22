import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Rocket,
  Globe,
  Server,
  TrendingUp,
  Clock,
  ExternalLink,
  Activity,
  Plus,
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import styles from './DeploymentsPage.module.css';
import { useDeployments, useCreateDeployment, useModels } from '../../../hooks/useApi';
import { staggerContainer, staggerItem } from '../../../lib/animations';
import type { Deployment } from '../../../types/api';

type Status = 'live' | 'active' | 'draining' | 'updating' | 'down' | 'stopped' | 'failed';

function normalizeStatus(s: string): Status {
  const lower = s.toLowerCase();
  if (lower === 'live' || lower === 'active') return 'live';
  if (lower === 'draining' || lower === 'updating') return 'draining';
  return 'down';
}

function statusVariant(s: Status): 'success' | 'warning' | 'danger' {
  if (s === 'live') return 'success';
  if (s === 'draining') return 'warning';
  return 'danger';
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function StatusBadge({ status }: { status: string }) {
  const normalized = normalizeStatus(status);
  const label = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  const variant = statusVariant(normalized);
  return (
    <span className={`${styles.badge} ${styles[`badge${label}`]}`}>
      <span className={styles.badgeDot} />
      {label}
    </span>
  );
}

function MiniChart({ status }: { status: string }) {
  const normalized = normalizeStatus(status);
  const bars = Array.from({ length: 20 }, () => Math.random() * 80 + 20);
  const max = Math.max(...bars, 1);
  const label = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  return (
    <div className={styles.chartSection}>
      {bars.map((v, i) => (
        <div
          key={i}
          className={`${styles.chartBar} ${styles[`chartBar${label}`]}`}
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  );
}

function NewDeploymentForm({ models, onSubmit, onCancel, isPending }: {
  models: Array<{ id: string; name: string }>;
  onSubmit: (modelName: string, endpointName: string) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [modelName, setModelName] = useState('');
  const [endpointName, setEndpointName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modelName && endpointName) {
      onSubmit(modelName, endpointName);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
      }}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--color-text-secondary)' }}>
            Model
          </label>
          <select
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              background: 'var(--color-background)',
              color: 'var(--color-text)',
              fontSize: 14,
            }}
            required
          >
            <option value="">Select model...</option>
            {models.map((m) => (
              <option key={m.id} value={m.name}>{m.name}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--color-text-secondary)' }}>
            Endpoint Name
          </label>
          <input
            value={endpointName}
            onChange={(e) => setEndpointName(e.target.value)}
            placeholder="e.g. my-api-endpoint"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              background: 'var(--color-background)',
              color: 'var(--color-text)',
              fontSize: 14,
            }}
            required
          />
        </div>
        <motion.button
          type="submit"
          className={styles.newBtn}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isPending}
        >
          {isPending ? 'Deploying...' : 'Create'}
        </motion.button>
        <motion.button
          type="button"
          onClick={onCancel}
          className={styles.btnSmall}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Cancel
        </motion.button>
      </form>
    </motion.div>
  );
}

export default function DeploymentsPage() {
  const [showForm, setShowForm] = useState(false);
  const { data: deployments = [], isLoading } = useDeployments();
  const { data: models = [] } = useModels();
  const createDeployment = useCreateDeployment();

  const normalized = deployments.map((d) => ({
    ...d,
    _normalized: normalizeStatus(d.status),
  }));

  const activeCount = normalized.filter((d) => d._normalized === 'live').length;
  const totalRequests = normalized.reduce((sum, d) => sum + (d.requests_total || 0), 0);
  const avgLatency = normalized.length
    ? Math.round(normalized.reduce((sum, d) => sum + (d.avg_latency_ms || 0), 0) / normalized.length)
    : 0;

  const summaryStats = [
    { label: 'Total Endpoints', value: String(deployments.length), icon: Server, iconClass: styles.statIconPrimary },
    { label: 'Active', value: String(activeCount), icon: Activity, iconClass: styles.statIconSuccess },
    { label: 'Avg Latency', value: `${avgLatency}ms`, icon: TrendingUp, iconClass: styles.statIconWarning },
    { label: 'Total Requests', value: formatNumber(totalRequests), icon: Globe, iconClass: styles.statIconAccent },
  ];

  const handleCreate = (modelName: string, endpointName: string) => {
    createDeployment.mutate(
      { model_name: modelName, endpoint_name: endpointName },
      { onSuccess: () => setShowForm(false) }
    );
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, color: 'var(--color-text-secondary)' }}>
          Loading deployments...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>Deployments</h1>
          <p className={styles.headerDesc}>Monitor and manage your live model endpoints</p>
        </div>
        <div className={styles.headerActions}>
          <motion.button
            className={styles.newBtn}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className={styles.newBtnIcon} />
            New Deployment
          </motion.button>
        </div>
      </div>

      {showForm && (
        <NewDeploymentForm
          models={models.map((m: any) => ({ id: m.id || m.name, name: m.name }))}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          isPending={createDeployment.isPending}
        />
      )}

      <motion.div
        className={styles.statsRow}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {summaryStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} className={styles.statCard} custom={i} variants={staggerItem}>
              <div className={styles.statTop}>
                <span className={styles.statLabel}>{stat.label}</span>
                <div className={`${styles.statIcon} ${stat.iconClass}`}>
                  <Icon />
                </div>
              </div>
              <div className={styles.statValue}>{stat.value}</div>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        className={styles.grid}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {normalized.map((dep) => {
          const label = dep._normalized.charAt(0).toUpperCase() + dep._normalized.slice(1);
          return (
            <motion.div key={dep.id} variants={staggerItem}>
              <Card hover padding="md" className={styles.depCard}>
                <div className={styles.depCardTop}>
                  <div className={styles.depIdentity}>
                    <div
                      className={`${styles.depAvatar} ${
                        styles[`depAvatar${label}`]
                      }`}
                    >
                      <Rocket />
                    </div>
                    <div>
                      <div className={styles.depName}>{dep.endpoint_name}</div>
                      <div className={styles.depModel}>{dep.model_name}</div>
                    </div>
                  </div>
                  <StatusBadge status={dep.status} />
                </div>

                <div className={styles.metrics}>
                  <div className={styles.metric}>
                    <div className={styles.metricValue}>{dep.avg_latency_ms || 0}ms</div>
                    <div className={styles.metricLabel}>Latency</div>
                  </div>
                  <div className={styles.metric}>
                    <div className={styles.metricValue}>{formatNumber(dep.requests_total || 0)}</div>
                    <div className={styles.metricLabel}>Requests</div>
                  </div>
                  <div className={styles.metric}>
                    <div className={styles.metricValue}>{dep.endpoint_name || 'prod'}</div>
                    <div className={styles.metricLabel}>Endpoint</div>
                  </div>
                </div>

                <MiniChart status={dep.status} />

                <div className={styles.cardFooter}>
                  <span className={styles.footerMeta}>
                    <Clock style={{ width: 12, height: 12, verticalAlign: 'middle', marginRight: 4 }} />
                    {dep.created_at ? new Date(dep.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                  <div className={styles.footerActions}>
                    <motion.button
                      className={styles.btnSmall}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <ExternalLink /> Details
                    </motion.button>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
