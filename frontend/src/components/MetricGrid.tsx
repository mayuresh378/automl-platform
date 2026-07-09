import { motion } from 'framer-motion';
import { Microchip, Cpu, MemoryStick, HardDrive } from 'lucide-react';
import { systemMetrics } from '../lib/mockData';

const ICONS = { gpu: Microchip, cpu: Cpu, memory: MemoryStick, storage: HardDrive };

const barColor = (v: number) => (v > 80 ? 'bg-danger' : v > 60 ? 'bg-warning' : 'bg-primary');

export function MetricGrid() {
  const entries = Object.entries(systemMetrics) as Array<[keyof typeof systemMetrics, typeof systemMetrics['gpu']]>;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {entries.map(([key, metric], i) => {
        const Icon = ICONS[key];
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="rounded-xl border border-border bg-card/60 p-4 hover:border-border-strong transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-zinc-400">
                <Icon className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{metric.label}</span>
              </div>
              <span className="font-mono text-sm text-zinc-100 tabular-nums">{metric.value}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metric.value}%` }}
                transition={{ duration: 0.8, delay: 0.15 + i * 0.05, ease: 'easeOut' }}
                className={`h-full rounded-full ${barColor(metric.value)}`}
              />
            </div>
            <div className="mt-2 text-[11px] text-zinc-600">{metric.detail}</div>
          </motion.div>
        );
      })}
    </div>
  );
}
