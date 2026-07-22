import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDashboardData, useMonitoringMetrics } from '../../../hooks/useApi';
import { AnimatedNumber, ScrollReveal } from '../../../components/motion';
import Card from '../../../components/ui/Card';
import styles from './DashboardPage.module.css';

const icons = {
  projects: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  datasets: 'M4 7c0-1.657 3.582-3 8-3s8 1.343 8 3M4 7v6c0 1.657 3.582 3 8 3s8-1.343 8-3V7M4 13v4c0 1.657 3.582 3 8 3s8-1.343 8-3v-4',
  models: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707M2 12h1m15.657 5.657l.707.707M12 20v1M12 3a9 9 0 00-9 9c0 2.1.72 4.03 1.93 5.56L6 20l2.07-1.44A8.97 8.97 0 0012 21a9 9 0 009-9 9 9 0 00-9-9z',
  deployments: 'M15.59 14.37a6 6 0 01-5.84 4.63 6 6 0 01-5.84-4.63M15.59 14.37a22 22 0 014.78-5.65A8.01 8.01 0 0014 2a22 22 0 00-5.65 4.78M15.59 14.37a6 6 0 01-.82 2.52 6 6 0 01-2 2 6 6 0 01-2.52.82m0 0a6 6 0 01-2.52-.82 6 6 0 01-2-2 6 6 0 01-.82-2.52M9 12a3 3 0 113 3 3 3 0 01-3-3z',
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  cpu: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z',
  trending: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
};

function SvgIcon({ path, size = 20 }: { path: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

const statCards = [
  { key: 'projects', label: 'Experiments', color: 'var(--color-secondary)', bg: 'rgba(79,70,229,0.08)' },
  { key: 'datasets', label: 'Datasets', color: 'var(--color-accent)', bg: 'rgba(6,182,212,0.08)' },
  { key: 'models', label: 'Models', color: 'var(--color-success)', bg: 'rgba(34,197,94,0.08)' },
  { key: 'deployments', label: 'Deployments', color: 'var(--color-warning)', bg: 'rgba(245,158,11,0.08)' },
];

export default function DashboardPage() {
  const navigate = useNavigate();

  const { experiments, models, datasets, deployments, activity, isLoading, isError } = useDashboardData();
  const { data: metrics } = useMonitoringMetrics();

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.grid4}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
        <div className={styles.grid3}>
          <div className={styles.skeletonLarge} />
          <div className={styles.skeletonLarge} />
          <div className={styles.skeletonLarge} />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <SvgIcon path={icons.datasets} size={40} />
          <h2 className={styles.emptyTitle}>Failed to load dashboard</h2>
          <p className={styles.emptyDesc}>Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const recentModels = (models || []).slice(0, 5);
  const recentDeployments = (deployments || []).slice(0, 5);
  const hasContent = recentModels.length > 0 || recentDeployments.length > 0;

  const stats = {
    projects: (experiments || []).length,
    datasets: (datasets || []).length,
    models: (models || []).length,
    deployments: (deployments || []).length,
  };

  const statValues = [
    { ...statCards[0], value: stats.projects },
    { ...statCards[1], value: stats.datasets },
    { ...statCards[2], value: stats.models },
    { ...statCards[3], value: stats.deployments },
  ];

  const cpuPercent = metrics?.cpu?.percent ?? 0;
  const memoryPercent = metrics?.memory?.percent ?? 0;
  const diskPercent = metrics?.disk?.percent ?? 0;

  const activityIconMap: Record<string, { icon: string; color: string }> = {
    experiment: { icon: icons.models, color: 'var(--color-secondary)' },
    model: { icon: icons.models, color: 'var(--color-success)' },
    dataset: { icon: icons.datasets, color: 'var(--color-accent)' },
    deployment: { icon: icons.deployments, color: 'var(--color-warning)' },
  };

  function timeAgo(dateStr: string) {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <div className={styles.page}>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.greeting}>Welcome, Guest</h1>
            <p className={styles.subtitle}>Here's your AutoML overview</p>
          </div>
          <div className={styles.actions}>
            <button className={styles.btnOutline} onClick={() => navigate('/app/datasets')}>
              Upload Dataset
            </button>
            <button className={styles.btnPrimary} onClick={() => navigate('/app/training')}>
              New Training
            </button>
          </div>
        </div>

        <div className={styles.grid4}>
          {statValues.map((stat, i) => (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
              whileHover={{ y: -4, boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 16px 48px rgba(0,0,0,0.15)' }}
              className={styles.statCard}
            >
              <div className={styles.statTop}>
                <div className={styles.statIcon} style={{ background: stat.bg, color: stat.color }}>
                  <SvgIcon path={icons[stat.key as keyof typeof icons]} />
                </div>
                <span className={styles.statChange}>
                  <SvgIcon path={icons.trending} size={12} />
                  {stat.value > 0 ? `${stat.value}` : '0'}
                </span>
              </div>
              <p className={styles.statValue}>
                <AnimatedNumber value={stat.value} />
              </p>
              <p className={styles.statLabel}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {!hasContent ? (
          <EmptyState onUpload={() => navigate('/app/datasets')} onTrain={() => navigate('/app/training')} />
        ) : (
          <div className={styles.bottomGrid}>
            <div className={styles.mainCol}>
              <Card>
                <div className={styles.chartCard}>
                  <div className={styles.chartHeader}>
                    <span className={styles.chartTitle}>Performance</span>
                    <span className={styles.chartMeta}>Last 24 hours</span>
                  </div>
                  <div className={styles.chartBody}>
                    <div className={styles.chartBars}>
                      {[55, 72, 48, 88, 65, 42, 78, 60, 85, 50, 70, 90].map((h, i) => (
                        <motion.div
                          key={i}
                          className={styles.chartBar}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: 0.3 + i * 0.04, type: 'spring', stiffness: 80, damping: 12 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {recentModels.length > 0 && (
                <Card>
                  <div className={styles.listHeader}>
                    <span className={styles.listTitle}>Recent Models</span>
                    <button className={styles.viewAll} onClick={() => navigate('/app/models')}>View all</button>
                  </div>
                  <div className={styles.listItems}>
                    {recentModels.map((m, i) => (
                      <motion.div
                        key={m.id}
                        className={styles.listItem}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
                        whileHover={{ x: 4, backgroundColor: 'var(--color-surface-hover)' }}
                      >
                        <div className={styles.listItemIcon} style={{ background: 'rgba(79,70,229,0.08)', color: 'var(--color-secondary)' }}>
                          <SvgIcon path={icons.models} size={16} />
                        </div>
                        <div className={styles.listItemInfo}>
                          <span className={styles.listItemName}>{m.name}</span>
                          <span className={styles.listItemMeta}>{m.model_type} {m.version ? `· v${m.version}` : ''}</span>
                        </div>
                        <span className={`${styles.badge} ${styles.badgeActive}`}>{m.status || 'active'}</span>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              )}

              {recentDeployments.length > 0 && (
                <Card>
                  <div className={styles.listHeader}>
                    <span className={styles.listTitle}>Deployments</span>
                    <button className={styles.viewAll} onClick={() => navigate('/app/deployments')}>View all</button>
                  </div>
                  <div className={styles.listItems}>
                    {recentDeployments.map((d, i) => (
                      <motion.div
                        key={d.id}
                        className={styles.listItem}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
                        whileHover={{ x: 4, backgroundColor: 'var(--color-surface-hover)' }}
                      >
                        <div className={styles.listItemIcon} style={{ background: 'rgba(245,158,11,0.08)', color: 'var(--color-warning)' }}>
                          <SvgIcon path={icons.deployments} size={16} />
                        </div>
                        <div className={styles.listItemInfo}>
                          <span className={styles.listItemName}>{d.name}</span>
                          <span className={styles.listItemMeta}>{d.model_name} · {d.requests_count || 0} requests</span>
                        </div>
                        <span className={`${styles.badge} ${styles.badgeActive}`}>{d.status || 'live'}</span>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            <div className={styles.sideCol}>
              {metrics && (
                <Card>
                  <div className={styles.listHeader}>
                    <span className={styles.listTitle}>System</span>
                  </div>
                  <div className={styles.metricsBody}>
                    {[
                      { label: 'CPU', value: cpuPercent, icon: icons.cpu },
                      { label: 'Memory', value: memoryPercent },
                      { label: 'Disk', value: diskPercent },
                    ].map((stat, i) => {
                      const val = typeof stat.value === 'number' ? Math.round(stat.value) : 0;
                      return (
                        <div key={stat.label} className={styles.metricRow}>
                          <div className={styles.metricLabelRow}>
                            <span className={styles.metricName}>{stat.label}</span>
                            <span className={styles.metricPercent}>{val}%</span>
                          </div>
                          <div className={styles.progressTrack}>
                            <motion.div
                              className={styles.progressBar}
                              initial={{ width: 0 }}
                              animate={{ width: `${val}%` }}
                              transition={{ delay: 0.5 + i * 0.1, type: 'spring', stiffness: 60, damping: 15 }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              <Card>
                <div className={styles.listHeader}>
                  <span className={styles.listTitle}>Activity</span>
                </div>
                <div className={styles.activityList}>
                  <AnimatePresence mode="popLayout">
                    {(activity || []).slice(0, 10).map((item, i) => {
                      const mapped = activityIconMap[item.resource_type] || { icon: icons.activity, color: 'var(--color-secondary)' };
                      return (
                        <motion.div
                          key={item.id}
                          className={styles.activityItem}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          transition={{ delay: i * 0.03, type: 'spring', stiffness: 300, damping: 25 }}
                          layout
                        >
                        <div className={styles.activityDot} style={{ background: mapped.color }} />
                        <div className={styles.activityInfo}>
                          <span className={styles.activityText}>{item.action} {item.resource_type}</span>
                          <span className={styles.activityTime}>{item.run_at ? timeAgo(item.run_at) : ''}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                  </AnimatePresence>
                </div>
              </Card>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function EmptyState({ onUpload, onTrain }: { onUpload: () => void; onTrain: () => void }) {
  return (
    <Card className={styles.emptyCard}>
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>
          <SvgIcon path={icons.models} size={32} />
        </div>
        <h2 className={styles.emptyTitle}>Welcome to AutoML</h2>
        <p className={styles.emptyDesc}>Upload a dataset and start training your first model</p>
        <div className={styles.emptyActions}>
          <button className={styles.btnPrimary} onClick={onUpload}>Upload Dataset</button>
          <button className={styles.btnOutline} onClick={onTrain}>Start Training</button>
        </div>
      </div>
    </Card>
  );
}
