import { useState, useEffect } from 'react';
import { api } from '../lib/api';

const STAT_DEFS = [
  { key: 'modelsTrained', label: 'Models trained', suffix: '' },
  { key: 'activeDeployments', label: 'Active deployments', suffix: '' },
  { key: 'inferenceRequestsToday', label: 'Requests today', suffix: '' },
  { key: 'avgLatencyMs', label: 'Avg latency', suffix: 'ms' },
] as const;

export function LiveStatStrip() {
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    api.monitoring.stats().then(setStats).catch(() => {});
    const id = setInterval(() => api.monitoring.stats().then(setStats).catch(() => {}), 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-wrap gap-x-8 gap-y-3">
      {STAT_DEFS.map((s) => (
        <div key={s.key}>
          <div className="font-mono text-xl font-semibold text-white tabular-nums">
            {(stats[s.key] ?? 0).toLocaleString()}
            {s.suffix}
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
