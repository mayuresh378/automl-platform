import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart3, Beaker, Clock } from 'lucide-react';
import { experimentsService } from '../../../services/experiments.service';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { PageContainer, PageHeader } from '../../../components/layout/PageContainer';
import { Badge } from '../../../components/ui/Badge';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { staggerContainer, staggerItem } from '../../../lib/animations';
import { formatDuration, timeAgo } from '../../../lib/formatters';
import { getErrorMessage } from '../../../services/http';

export default function ExperimentsPage() {
  const { data: experiments, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['experiments'],
    queryFn: () => experimentsService.list(),
    select: (d) => d.experiments,
  });

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Experiments" description="Track and compare experiment results" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />)}
        </div>
      </PageContainer>
    );
  }

  if (isError) {
    return <PageContainer><ErrorState title="Failed to load experiments" message={getErrorMessage(error)} onRetry={refetch} />;
  }

  return (
    <PageContainer>
      <PageHeader title="Experiments" description="Track and compare experiment results" />

      {!experiments || experiments.length === 0 ? (
        <EmptyState icon={<Beaker className="w-8 h-8" />} title="No experiments yet" description="Start a training job to create experiments" />
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2">
          <div className="grid grid-cols-6 gap-4 px-4 py-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
            <span className="col-span-2">Name</span>
            <span>Model</span>
            <span>Accuracy</span>
            <span>F1 Score</span>
            <span>Status</span>
          </div>
          {(experiments as any[]).map((exp: any) => (
            <motion.div key={exp.id} variants={staggerItem}>
              <Card padding="md">
                <div className="grid grid-cols-6 gap-4 items-center">
                  <div className="col-span-2 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{exp.name}</p>
                    <p className="text-xs text-zinc-500">{exp.dataset_name} → {exp.target_column} · {timeAgo(exp.created_at)}</p>
                  </div>
                  <div><Badge variant="info">{exp.algorithm}</Badge></div>
                  <div className="text-sm text-zinc-300">{exp.metrics?.accuracy != null ? `${(exp.metrics.accuracy * 100).toFixed(1)}%` : '-'}</div>
                  <div className="text-sm text-zinc-300">{exp.metrics?.f1_score != null ? `${(exp.metrics.f1_score * 100).toFixed(1)}%` : '-'}</div>
                  <div><StatusBadge status={exp.status} /></div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </PageContainer>
  );
}
