import { motion } from 'framer-motion';
import { Loader2, Clock } from 'lucide-react';
import { trainingQueue } from '../lib/mockData';

const statusStyle = {
  training: 'text-primary',
  queued: 'text-zinc-500',
  complete: 'text-success',
};

export function TrainingQueue() {
  return (
    <div className="rounded-xl border border-border bg-card/60">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
        <span className="text-sm font-medium text-zinc-100">Training queue</span>
        <span className="text-[11px] font-mono text-zinc-500">{trainingQueue.length} jobs</span>
      </div>
      <div className="divide-y divide-border">
        {trainingQueue.map((job, i) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="px-4 py-3"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                {job.status === 'training' ? (
                  <Loader2 className="h-3.5 w-3.5 text-primary animate-spin shrink-0" />
                ) : (
                  <Clock className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
                )}
                <span className="text-[13px] text-zinc-200 truncate">{job.datasetName}</span>
                <span className="text-[11px] text-zinc-600 shrink-0 hidden sm:inline">→ {job.targetColumn}</span>
              </div>
              <span className={`text-[11px] font-mono shrink-0 ${statusStyle[job.status]}`}>
                {job.status === 'queued' ? 'queued' : `${job.progress}%`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${job.progress}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                />
              </div>
              <span className="text-[10px] font-mono text-zinc-600 w-16 text-right shrink-0">
                {job.algorithm}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
