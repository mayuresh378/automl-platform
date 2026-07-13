import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../lib/animations';
import { NeuralPulse } from '../components/NeuralPulse';
import { QuickActions } from '../components/QuickActions';
import { LiveStatStrip } from '../components/LiveStatStrip';
import { MetricGrid } from '../components/MetricGrid';
import { TrainingQueue } from '../components/TrainingQueue';
import { AIAssistantPanel } from '../components/AIAssistantPanel';
import { ExperimentsTable } from '../components/ExperimentsTable';
import { ActivityTimeline } from '../components/ActivityTimeline';

export function Dashboard() {
  return (
    <div className="flex-1 min-w-0">
      {/* Breadcrumb */}
      <div className="px-4 md:px-8 pt-6 text-xs text-zinc-600">
        Workspace <span className="mx-1.5 text-zinc-700">/</span>
        <span className="text-zinc-300">Dashboard</span>
      </div>

      {/* Hero */}
      <section className="relative px-4 md:px-8 pt-4 pb-10 overflow-hidden">
        <div
          className="pointer-events-none absolute -top-24 left-1/3 h-[420px] w-[420px] rounded-full opacity-20 blur-[100px] animate-drift"
          style={{ background: 'radial-gradient(circle, #6366F1 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute top-40 right-1/4 h-[300px] w-[300px] rounded-full opacity-10 blur-[80px] animate-drift"
          style={{ background: 'radial-gradient(circle, #06B6D4 0%, transparent 70%)', animationDelay: '-4s' }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/6 h-[200px] w-[200px] rounded-full opacity-10 blur-[60px] animate-drift"
          style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)', animationDelay: '-8s' }}
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center"
        >
          <motion.div variants={staggerItem}>
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/[0.03] px-3 py-1 text-[11px] text-zinc-400 mb-4"
            >
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-1.5 w-1.5 rounded-full bg-success"
              />
              All systems operational
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-3xl md:text-4xl font-semibold tracking-tight text-gradient leading-[1.15] mb-3"
            >
              Every model you train,
              <br />
              watched in real time.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="text-[15px] text-zinc-400 max-w-md mb-6 leading-relaxed"
            >
              Upload a dataset, let AutoML Studio race the field, and ship a prediction endpoint —
              without leaving this screen.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mb-8"
            >
              <QuickActions />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <LiveStatStrip />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
            whileHover={{ y: -2, boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 12px 40px rgba(99, 102, 241, 0.15)' }}
            className="relative rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-4 h-[340px] noise-overlay"
          >
            <NeuralPulse />
          </motion.div>
        </motion.div>
      </section>

      {/* System metrics */}
      <section className="px-4 md:px-8 pb-8">
        <MetricGrid />
      </section>

      {/* Training queue + AI assistant */}
      <section className="px-4 md:px-8 pb-8 grid lg:grid-cols-[1.4fr_1fr] gap-4">
        <TrainingQueue />
        <AIAssistantPanel />
      </section>

      {/* Experiments + activity */}
      <section className="px-4 md:px-8 pb-10 grid lg:grid-cols-[1.5fr_1fr] gap-4 items-start">
        <ExperimentsTable />
        <ActivityTimeline />
      </section>
    </div>
  );
}
