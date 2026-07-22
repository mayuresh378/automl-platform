import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { trainingService } from '../../../services/training.service';
import { datasetsService } from '../../../services/datasets.service';
import Card from '../../../components/ui/Card';
import { staggerContainer, staggerItem, fadeProps } from '../../../lib/animations';
import type { Experiment } from '../../../types/api';
import styles from './TrainingPage.module.css';

type RunStatus = Experiment['status'];

function StatusBadge({ status }: { status: RunStatus }) {
  const statusClass = `status${status.charAt(0).toUpperCase() + status.slice(1)}`;
  return (
    <span className={`${styles.statusBadge} ${(styles as any)[statusClass]}`}>
      <span className={styles.statusDot} />
      {status}
    </span>
  );
}

function accuracyClass(a: number | null) {
  if (a === null) return '';
  if (a >= 0.9) return styles.accuracyHigh;
  if (a >= 0.8) return styles.accuracyMid;
  return styles.accuracyLow;
}

function formatAccuracy(score?: number | null): string {
  if (score == null) return '—';
  const pct = score <= 1 ? score * 100 : score;
  return pct.toFixed(1) + '%';
}

function formatDuration(seconds?: number | null): string {
  if (seconds == null) return '—';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return `${h}h ${rm}m`;
}

function SvgIcon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const icons = {
  brain: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707M2 12h1m15.657 5.657l.707.707M12 20v1M12 3a9 9 0 00-9 9c0 2.1.72 4.03 1.93 5.56L6 20l2.07-1.44A8.97 8.97 0 0012 21a9 9 0 009-9 9 9 0 00-9-9z',
  play: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  check: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  empty: 'M4 7c0-1.657 3.582-3 8-3s8 1.343 8 3M4 7v6c0 1.657 3.582 3 8 3s8-1.343 8-3V7M4 13v4c0 1.657 3.582 3 8 3s8-1.343 8-3v-4',
  plus: 'M12 4v16m8-8H4',
  close: 'M6 18L18 6M6 6l12 12',
};

const statCardDefs = [
  { key: 'total', label: 'Total Runs', icon: icons.brain, color: 'var(--color-secondary)', bg: 'rgba(79,70,229,0.08)' },
  { key: 'active', label: 'Active Runs', icon: icons.play, color: 'var(--color-info)', bg: 'rgba(59,130,246,0.08)' },
  { key: 'best', label: 'Best Accuracy', icon: icons.check, color: 'var(--color-success)', bg: 'rgba(34,197,94,0.08)' },
  { key: 'avgDur', label: 'Avg Duration', icon: icons.clock, color: 'var(--color-warning)', bg: 'rgba(245,158,11,0.08)' },
];

export default function TrainingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [targetColumn, setTargetColumn] = useState('');

  const { data: experiments = [], isLoading: loadingExperiments } = useQuery({
    queryKey: ['training'],
    queryFn: () => trainingService.list(),
    select: (d) => d.experiments,
  });

  const { data: datasets = [], isLoading: loadingDatasets } = useQuery({
    queryKey: ['datasets'],
    queryFn: () => datasetsService.list(),
    select: (d) => d.datasets,
  });

  const stats = useMemo(() => {
    const completed = experiments.filter((r) => r.status === 'completed' && r.metrics?.accuracy != null);
    const bestAccuracy = completed.length > 0
      ? Math.max(...completed.map((r) => r.metrics!.accuracy!))
      : 0;
    const durations = experiments.filter((r) => r.training_time != null).map((r) => r.training_time!);
    const avgDur = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    return {
      total: experiments.length,
      active: experiments.filter((r) => r.status === 'running').length,
      bestAccuracy: formatAccuracy(bestAccuracy),
      avgDuration: formatDuration(avgDur),
    };
  }, [experiments]);

  const statValues = statCardDefs.map((def) => ({ ...def, value: stats[def.key as keyof typeof stats] }));

  async function handleStartTraining() {
    if (!selectedDataset || !targetColumn.trim()) return;
    await trainingService.start(selectedDataset, targetColumn.trim());
    queryClient.invalidateQueries({ queryKey: ['training'] });
    setShowForm(false);
    setSelectedDataset('');
    setTargetColumn('');
  }

  return (
    <div className={styles.page}>
      <motion.div {...fadeProps('up')}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Training</h1>
            <p className={styles.subtitle}>Monitor and manage your model training runs</p>
          </div>
          <button className={styles.btnPrimary} onClick={() => setShowForm((v) => !v)}>
            <SvgIcon d={showForm ? icons.close : icons.plus} />
            {showForm ? 'Cancel' : 'New Training Run'}
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', marginBottom: 'var(--space-6)' }}
            >
              <Card>
                <div style={{ padding: 'var(--space-5)', display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <label style={{ display: 'block', fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
                      Dataset
                    </label>
                    <select
                      value={selectedDataset}
                      onChange={(e) => setSelectedDataset(e.target.value)}
                      style={{
                        width: '100%', height: 40, padding: '0 var(--space-3)',
                        borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)',
                        background: 'var(--color-elevated)', color: 'var(--color-text)',
                        fontSize: 'var(--text-body-sm)',
                      }}
                    >
                      <option value="">{loadingDatasets ? 'Loading datasets…' : 'Select a dataset'}</option>
                      {datasets.map((ds) => (
                        <option key={ds.name} value={ds.name}>{ds.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <label style={{ display: 'block', fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
                      Target Column
                    </label>
                    <input
                      type="text"
                      value={targetColumn}
                      onChange={(e) => setTargetColumn(e.target.value)}
                      placeholder="e.g. price"
                      style={{
                        width: '100%', height: 40, padding: '0 var(--space-3)',
                        borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)',
                        background: 'var(--color-elevated)', color: 'var(--color-text)',
                        fontSize: 'var(--text-body-sm)',
                      }}
                    />
                  </div>
                  <button
                    className={styles.btnPrimary}
                    disabled={!selectedDataset || !targetColumn.trim()}
                    onClick={handleStartTraining}
                    style={{ opacity: !selectedDataset || !targetColumn.trim() ? 0.5 : 1 }}
                  >
                    <SvgIcon d={icons.play} />
                    Start Training
                  </button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {loadingExperiments ? (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} />
          </div>
        ) : experiments.length === 0 ? (
          <Card>
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <SvgIcon d={icons.empty} size={24} />
              </div>
              <p className={styles.emptyTitle}>No training runs yet</p>
              <p className={styles.emptyDesc}>Start your first training run to see results here.</p>
            </div>
          </Card>
        ) : (
          <>
            <motion.div
              className={styles.statsBar}
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {statValues.map((stat) => (
                <motion.div key={stat.key} variants={staggerItem} className={styles.statCard}>
                  <div className={styles.statTop}>
                    <div className={styles.statIcon} style={{ background: stat.bg, color: stat.color }}>
                      <SvgIcon d={stat.icon} />
                    </div>
                  </div>
                  <p className={styles.statValue}>{stat.value}</p>
                  <p className={styles.statLabel}>{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>

            <Card>
              <div className={styles.tableHeader}>
                <span className={styles.tableTitle}>Training Runs</span>
                <span className={styles.tableMeta}>{experiments.length} runs</span>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Run ID</th>
                      <th>Name</th>
                      <th>Algorithm</th>
                      <th>Status</th>
                      <th>Accuracy</th>
                      <th>Duration</th>
                      <th>Started</th>
                    </tr>
                  </thead>
                  <motion.tbody
                    className={styles.tableBody}
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {experiments.map((exp) => (
                      <motion.tr
                        key={exp.id}
                        variants={staggerItem}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/app/training/${exp.id}`)}
                      >
                        <td className={styles.runId}>{exp.id.slice(0, 8)}</td>
                        <td className={styles.modelName}>{exp.name}</td>
                        <td><span className={styles.algoTag}>{exp.model}</span></td>
                        <td><StatusBadge status={exp.status} /></td>
                        <td className={`${styles.accuracy} ${accuracyClass(exp.metrics?.accuracy ?? null)}`}>
                          {formatAccuracy(exp.metrics?.accuracy)}
                        </td>
                        <td className={styles.duration}>{formatDuration(exp.duration_seconds)}</td>
                        <td className={styles.startedAt}>
                          {new Date(exp.created_at).toLocaleString()}
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </motion.div>
    </div>
  );
}
