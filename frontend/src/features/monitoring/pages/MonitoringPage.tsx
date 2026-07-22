import { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatedNumber, ScrollReveal, TiltCard } from '../../../components/motion';
import Card from '../../../components/ui/Card';
import styles from './MonitoringPage.module.css';
import { useMonitoringMetrics, useMonitoringStats } from '../../../hooks/useApi';

const TIME_RANGES = ['1h', '6h', '24h', '7d'] as const;

function ArrowIcon({ direction }: { direction: 'up' | 'down' }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      {direction === 'up' ? (
        <path d="M6 2.5V9.5M6 2.5L3 5.5M6 2.5L9 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M6 9.5V2.5M6 9.5L3 6.5M6 9.5L9 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

interface MetricCardDef {
  label: string;
  value: string;
  subtext: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  color: string;
  bg: string;
  barPercent: number;
  barColor: string;
  iconPath: string;
}

function buildMetricCards(metrics: any): MetricCardDef[] {
  const cpu = metrics?.cpu?.percent ?? 0;
  const mem = metrics?.memory?.percent ?? 0;
  const disk = metrics?.disk?.percent ?? 0;
  const net = metrics?.network?.bytes_recv ?? 0;

  return [
    {
      label: 'CPU Usage',
      value: `${cpu.toFixed(1)}%`,
      subtext: `${metrics?.cpu?.cores ?? 0} cores · load avg ${metrics?.cpu?.load_avg ?? 0}`,
      trend: cpu > 80 ? 'up' : 'down',
      trendValue: cpu > 80 ? 'high' : 'normal',
      color: 'var(--color-secondary)',
      bg: 'rgba(79, 70, 229, 0.08)',
      barPercent: cpu,
      barColor: 'var(--color-secondary)',
      iconPath: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    },
    {
      label: 'Memory Usage',
      value: `${mem.toFixed(1)}%`,
      subtext: `${((metrics?.memory?.used ?? 0) / 1073741824).toFixed(1)}GB / ${((metrics?.memory?.total ?? 0) / 1073741824).toFixed(1)}GB`,
      trend: mem > 85 ? 'up' : 'down',
      trendValue: mem > 85 ? 'high' : 'normal',
      color: 'var(--color-accent)',
      bg: 'rgba(6, 182, 212, 0.08)',
      barPercent: mem,
      barColor: 'var(--color-accent)',
      iconPath: 'M22 12h-4l-3 9L9 3l-3 9H2',
    },
    {
      label: 'Disk Usage',
      value: `${disk.toFixed(1)}%`,
      subtext: `${((metrics?.disk?.used ?? 0) / 1073741824).toFixed(1)}GB / ${((metrics?.disk?.total ?? 0) / 1073741824).toFixed(1)}GB`,
      trend: disk > 90 ? 'up' : 'down',
      trendValue: disk > 90 ? 'critical' : 'normal',
      color: 'var(--color-success)',
      bg: 'rgba(34, 197, 94, 0.08)',
      barPercent: disk,
      barColor: 'var(--color-success)',
      iconPath: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
    },
    {
      label: 'Network I/O',
      value: `${(net / 1048576).toFixed(1)} MB`,
      subtext: `Platform: ${metrics?.platform ?? 'N/A'} · Python ${metrics?.python_version ?? ''}`,
      trend: 'up',
      trendValue: 'active',
      color: 'var(--color-warning)',
      bg: 'rgba(245, 158, 11, 0.08)',
      barPercent: Math.min((net / 1073741824) * 100, 100),
      barColor: 'var(--color-warning)',
      iconPath: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z',
    },
  ];
}

interface Alert {
  title: string;
  description: string;
  time: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
}

const defaultAlerts: Alert[] = [
  { title: 'System metrics collected', description: 'Monitoring service is active and collecting data', time: 'just now', severity: 'success' },
];

export default function MonitoringPage() {
  const [timeRange, setTimeRange] = useState<string>('24h');
  const { data: metrics, isLoading: metricsLoading } = useMonitoringMetrics();
  const { data: stats, isLoading: statsLoading } = useMonitoringStats();

  const metricCards = buildMetricCards(metrics);

  const summaryStats = [
    { label: 'Experiments', value: stats?.total_experiments ?? 0 },
    { label: 'Models', value: stats?.total_models ?? 0 },
    { label: 'Datasets', value: stats?.total_datasets ?? 0 },
    { label: 'Deployments', value: stats?.total_deployments ?? 0 },
    { label: 'Predictions', value: stats?.total_predictions ?? 0 },
  ];

  const latencyBars = Array.from({ length: 24 }, () => Math.random() * 60 + 30);
  const errorBars = Array.from({ length: 24 }, () => Math.random() * 12 + 2);
  const driftBars = Array.from({ length: 24 }, () => Math.random() * 30 + 10);

  if (metricsLoading || statsLoading) {
    return (
      <div className={styles.page}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, color: 'var(--color-text-secondary)' }}>
          Loading monitoring data...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Monitoring</h1>
            <p className={styles.description}>System health, performance metrics, and alerts</p>
          </div>
          <div className={styles.timeRange}>
            {TIME_RANGES.map((range) => (
              <button
                key={range}
                className={`${styles.timeRangeBtn} ${timeRange === range ? styles.timeRangeBtnActive : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <motion.div className={styles.metricsGrid} variants={container} initial="hidden" animate="show">
          {metricCards.map((card) => (
            <motion.div key={card.label} variants={item}>
              <div className={styles.metricCard}>
                <div className={styles.metricTop}>
                  <span className={styles.metricLabel}>{card.label}</span>
                  <div className={styles.metricIcon} style={{ background: card.bg, color: card.color }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={card.iconPath} />
                    </svg>
                  </div>
                </div>
                <div className={styles.metricValue}>{card.value}</div>
                <div className={styles.metricSubtext}>{card.subtext}</div>
                <div className={`${styles.metricTrend} ${card.trend === 'up' ? styles.trendUp : styles.trendDown}`}>
                  <ArrowIcon direction={card.trend} />
                  {card.trendValue}
                </div>
                <div className={styles.metricBarTrack}>
                  <motion.div
                    className={styles.metricBarFill}
                    style={{ background: card.barColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${card.barPercent}%` }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className={styles.statsRow || styles.metricsGrid}
          variants={container}
          initial="hidden"
          animate="show"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}
        >
          {summaryStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={item}
              whileHover={{ y: -3, boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 12px 40px rgba(0,0,0,0.12)' }}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                padding: 16,
                textAlign: 'center',
                cursor: 'default',
              }}
            >
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>{stat.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)' }}>
                <AnimatedNumber value={stat.value} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className={styles.twoCol}>
          <motion.div
            className={styles.chartSection}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className={styles.chartHeader}>
              <span className={styles.chartTitle}>Performance Over Time</span>
              <span className={styles.chartPeriod}>Last {timeRange}</span>
            </div>
            <div className={styles.chartBody}>
              <div className={styles.chartBars}>
                {latencyBars.map((h, i) => (
                  <motion.div
                    key={i}
                    className={`${styles.chartBar} ${styles.chartBarLatency}`}
                    style={{ opacity: 0.7 }}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.3 + i * 0.02, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  />
                ))}
              </div>
              <div className={styles.chartBars} style={{ height: 60, borderBottom: 'none', paddingTop: 'var(--space-3)' }}>
                {driftBars.map((h, i) => (
                  <motion.div
                    key={i}
                    className={`${styles.chartBar} ${styles.chartBarDrift}`}
                    style={{ opacity: 0.6 }}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.5 + i * 0.02, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  />
                ))}
              </div>
              <div className={styles.chartBars} style={{ height: 40, borderTop: 'none', paddingTop: 0 }}>
                {errorBars.map((h, i) => (
                  <motion.div
                    key={i}
                    className={`${styles.chartBar} ${styles.chartBarError}`}
                    style={{ opacity: 0.6 }}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.7 + i * 0.02, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  />
                ))}
              </div>
              <div className={styles.chartLegend}>
                <div className={styles.legendItem}>
                  <div className={styles.legendDot} style={{ background: 'var(--color-secondary)' }} />
                  CPU / Memory
                </div>
                <div className={styles.legendItem}>
                  <div className={styles.legendDot} style={{ background: 'var(--color-warning)' }} />
                  Network
                </div>
                <div className={styles.legendItem}>
                  <div className={styles.legendDot} style={{ background: 'var(--color-danger)' }} />
                  Disk
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className={styles.alertsSection}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>System Info</span>
              <span className={styles.badgeCount}>{summaryStats.length}</span>
            </div>
            <div className={styles.alertList}>
              {summaryStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className={styles.alertItem}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }}
                >
                  <div className={`${styles.alertDot} ${styles.alertDotInfo}`} />
                  <div className={styles.alertContent}>
                    <div className={styles.alertTitle}>{stat.label}</div>
                    <div className={styles.alertDescription}>Total: {stat.value}</div>
                  </div>
                </motion.div>
              ))}
              {metrics && (
                <motion.div
                  className={styles.alertItem}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  <div className={`${styles.alertDot} ${styles.alertDotSuccess}`} />
                  <div className={styles.alertContent}>
                    <div className={styles.alertTitle}>Python {metrics.python_version}</div>
                    <div className={styles.alertDescription}>Platform: {metrics.platform}</div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>System Resources</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { label: 'CPU', percent: metrics?.cpu?.percent ?? 0, color: 'var(--color-secondary)', detail: `${metrics?.cpu?.cores ?? 0} cores` },
              { label: 'Memory', percent: metrics?.memory?.percent ?? 0, color: 'var(--color-accent)', detail: `${((metrics?.memory?.used ?? 0) / 1073741824).toFixed(1)} / ${((metrics?.memory?.total ?? 0) / 1073741824).toFixed(1)} GB` },
              { label: 'Disk', percent: metrics?.disk?.percent ?? 0, color: 'var(--color-success)', detail: `${((metrics?.disk?.used ?? 0) / 1073741824).toFixed(1)} / ${((metrics?.disk?.total ?? 0) / 1073741824).toFixed(1)} GB` },
            ].map((res) => (
              <TiltCard key={res.label} glareColor={`${res.color}33`} maxTilt={3} scale={1.01}>
                <div style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 12,
                  padding: 20,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{res.label}</span>
                    <span style={{ fontSize: 20, fontWeight: 700, color: res.color }}>{res.percent.toFixed(1)}%</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
                    <motion.div
                      style={{ height: '100%', borderRadius: 3, background: res.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${res.percent}%` }}
                      transition={{ duration: 1, delay: 0.3, type: 'spring', stiffness: 50, damping: 15 }}
                    />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 8 }}>{res.detail}</div>
                </div>
              </TiltCard>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
