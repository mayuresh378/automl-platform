import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Activity, Cpu, HardDrive, Wifi, AlertTriangle, Clock, BarChart3,
  TrendingUp, Server, RefreshCw, ChevronDown, Zap, Brain,
} from 'lucide-react';
import { useMonitoringDashboard } from '../../../hooks/useApi';
import type { MonitoringDashboard } from '../../../services/monitoring.service';
import styles from './MonitoringPage.module.css';

const TIME_RANGES = ['1h', '6h', '24h', '7d'] as const;

function StatusDot({ status }: { status: string }) {
  const color = status === 'healthy' ? '#22c55e' : status === 'warning' ? '#f59e0b' : '#ef4444';
  return <span className={styles.statusDot} style={{ background: color }} />;
}

function MetricCard({ icon, label, value, sub, color, barPct }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string; barPct?: number;
}) {
  return (
    <motion.div className={styles.metricCard} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className={styles.metricTop}>
        <span className={styles.metricLabel}>{label}</span>
        <div className={styles.metricIcon} style={{ background: `${color}15`, color }}>{icon}</div>
      </div>
      <div className={styles.metricValue}>{value}</div>
      {sub && <div className={styles.metricSub}>{sub}</div>}
      {barPct != null && (
        <div className={styles.barTrack}>
          <motion.div className={styles.barFill} style={{ background: color }}
            initial={{ width: 0 }} animate={{ width: `${Math.min(barPct, 100)}%` }}
            transition={{ duration: 0.8, delay: 0.2 }} />
        </div>
      )}
    </motion.div>
  );
}

function ChartCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`${styles.chartCard} ${className || ''}`}>
      <div className={styles.chartHeader}>
        <span className={styles.chartTitle}>{title}</span>
      </div>
      <div className={styles.chartBody}>{children}</div>
    </div>
  );
}

const DRIFT_COLORS = ['#6366f1', '#f59e0b'];
const PIE_COLORS = ['#22c55e', '#ef4444'];

export default function MonitoringPage() {
  const [timeRange, setTimeRange] = useState<string>('24h');
  const { data: dash, isLoading } = useMonitoringDashboard();

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <RefreshCw size={24} className={styles.spin} />
          <span>Loading monitoring data...</span>
        </div>
      </div>
    );
  }

  if (!dash) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <AlertTriangle size={24} />
          <span>Failed to load monitoring data</span>
        </div>
      </div>
    );
  }

  const d = dash as MonitoringDashboard;

  return (
    <div className={styles.page}>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Monitoring</h1>
            <p className={styles.subtitle}>Production health, performance, and drift</p>
          </div>
          <div className={styles.timeRange}>
            {TIME_RANGES.map((r) => (
              <button key={r} className={`${styles.timeBtn} ${timeRange === r ? styles.timeBtnActive : ''}`}
                onClick={() => setTimeRange(r)}>{r}</button>
            ))}
          </div>
        </div>

        {/* Row 1: Key metrics */}
        <div className={styles.metricsRow}>
          <MetricCard icon={<Activity size={18} />} label="Total Predictions" value={d.predictions.total} sub={`${d.predictions.today} today · ${d.predictions.last_hour} last hour`} color="#6366f1" />
          <MetricCard icon={<Zap size={18} />} label="Avg Latency" value={`${d.latency.avg}ms`} sub={`p50: ${d.latency.p50}ms · p95: ${d.latency.p95}ms`} color="#06b6d4" barPct={Math.min(d.latency.avg / 5, 100)} />
          <MetricCard icon={<Cpu size={18} />} label="CPU" value={`${d.cpu.toFixed(1)}%`} sub={`${d.cpu_cores} cores · load ${d.load_avg}`} color="#8b5cf6" barPct={d.cpu} />
          <MetricCard icon={<HardDrive size={18} />} label="RAM" value={`${d.ram.toFixed(1)}%`} sub={`${d.ram_used_gb}GB / ${d.ram_total_gb}GB`} color="#f59e0b" barPct={d.ram} />
          <MetricCard icon={<Wifi size={18} />} label="Traffic" value={`${d.traffic.requests_per_minute}`} sub="requests/min" color="#10b981" barPct={Math.min(d.traffic.requests_per_minute * 10, 100)} />
          <MetricCard icon={<BarChart3 size={18} />} label="Error Rate" value={`${d.error_rate}%`} sub={`${d.success_rate}% success rate`} color={d.error_rate > 10 ? '#ef4444' : '#22c55e'} barPct={d.error_rate} />
        </div>

        {/* Row 2: Charts */}
        <div className={styles.chartsRow}>
          <ChartCard title="Traffic Over Time">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={d.traffic.per_hour}>
                <defs>
                  <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} />
                <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#trafficGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Latency Distribution">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={d.latency.histogram}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} />
                <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {d.latency.histogram.map((_, i) => (
                    <Cell key={i} fill={['#22c55e', '#86efac', '#fbbf24', '#f97316', '#ef4444'][i] || '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Row 3: Drift + Confidence */}
        <div className={styles.chartsRow}>
          <ChartCard title="Drift Monitor">
            <div className={styles.driftBadges}>
              <div className={styles.driftBadge}>
                <Brain size={14} />
                <span>Model Drift</span>
                <StatusDot status={d.model_drift.status} />
                <span className={styles.driftScore}>{d.model_drift.score}%</span>
              </div>
              <div className={styles.driftBadge}>
                <Activity size={14} />
                <span>Data Drift</span>
                <StatusDot status={d.data_drift.status} />
                <span className={styles.driftScore}>{d.data_drift.score}</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={d.drift_timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} />
                <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="model_drift" stroke="#6366f1" strokeWidth={2} dot={false} name="Model Drift" />
                <Line type="monotone" dataKey="data_drift" stroke="#f59e0b" strokeWidth={2} dot={false} name="Data Drift" />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Confidence Distribution">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={d.confidence_distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} />
                <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
            <div className={styles.pieRow}>
              <div className={styles.pieItem}>
                <ResponsiveContainer width={100} height={100}>
                  <PieChart>
                    <Pie data={[{ name: 'Success', value: d.success_rate }, { name: 'Error', value: d.error_rate }]}
                      cx="50%" cy="50%" innerRadius={25} outerRadius={40} paddingAngle={3} dataKey="value">
                      {PIE_COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className={styles.pieLabel}>
                  <span style={{ color: '#22c55e' }}>{d.success_rate}% success</span>
                  <span style={{ color: '#ef4444' }}>{d.error_rate}% error</span>
                </div>
              </div>
              <div className={styles.latencyStats}>
                <div className={styles.latStat}><span>p50</span><strong>{d.latency.p50}ms</strong></div>
                <div className={styles.latStat}><span>p95</span><strong>{d.latency.p95}ms</strong></div>
                <div className={styles.latStat}><span>p99</span><strong>{d.latency.p99}ms</strong></div>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Row 4: Alerts + Logs */}
        <div className={styles.chartsRow}>
          <ChartCard title="Alerts">
            <div className={styles.alertList}>
              {d.alerts.map((a, i) => (
                <motion.div key={i} className={styles.alertItem}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <span className={`${styles.alertDot} ${styles[`alertDot${a.severity}`] || styles.alertDotInfo}`} />
                  <div className={styles.alertContent}>
                    <div className={styles.alertTitle}>{a.title}</div>
                    <div className={styles.alertMsg}>{a.message}</div>
                  </div>
                  <span className={styles.alertTime}>{a.time}</span>
                </motion.div>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Recent Predictions">
            <div className={styles.logsTable}>
              <div className={styles.logsHeader}>
                <span>Model</span><span>Prediction</span><span>Confidence</span><span>Latency</span><span>Time</span>
              </div>
              {d.logs.slice(0, 10).map((log, i) => (
                <motion.div key={i} className={styles.logRow}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                  <span className={styles.logModel}>{log.model}</span>
                  <span className={styles.logPred}>{log.prediction}</span>
                  <span className={styles.logConf}>
                    {log.confidence != null ? `${(log.confidence * 100).toFixed(1)}%` : '—'}
                  </span>
                  <span className={styles.logLatency}>{log.latency_ms != null ? `${log.latency_ms}ms` : '—'}</span>
                  <span className={styles.logTime}>
                    {log.time ? new Date(log.time).toLocaleTimeString() : '—'}
                  </span>
                </motion.div>
              ))}
              {d.logs.length === 0 && (
                <div className={styles.emptyLogs}>No prediction logs yet</div>
              )}
            </div>
          </ChartCard>
        </div>
      </motion.div>
    </div>
  );
}
