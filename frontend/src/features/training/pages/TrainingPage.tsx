import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Brain, Play, BarChart3, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { datasetsService } from '../../../services/datasets.service';
import { trainingService } from '../../../services/training.service';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { PageContainer, PageHeader, PageSection } from '../../../components/layout/PageContainer';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { useNotification } from '../../../hooks/useNotification';
import { staggerContainer, staggerItem } from '../../../lib/animations';
import { formatDuration, timeAgo } from '../../../lib/formatters';
import { getErrorMessage } from '../../../services/http';

export default function TrainingPage() {
  const qc = useQueryClient();
  const { notifySuccess, notifyError } = useNotification();
  const [selectedDataset, setSelectedDataset] = useState('');
  const [targetColumn, setTargetColumn] = useState('');

  const { data: datasets, isLoading: datasetsLoading } = useQuery({
    queryKey: ['datasets'],
    queryFn: () => datasetsService.list(),
    select: (d) => d.datasets,
  });

  const { data: experiments, isLoading: expLoading, isError: expError, error: expErr, refetch: expRefetch } = useQuery({
    queryKey: ['experiments'],
    queryFn: () => trainingService.list(),
    select: (d) => d.experiments,
  });

  const { data: queue, isLoading: queueLoading } = useQuery({
    queryKey: ['training', 'queue'],
    queryFn: () => trainingService.queue(),
    select: (d) => d.jobs,
  });

  const trainingMutation = useMutation({
    mutationFn: () => trainingService.start(selectedDataset, targetColumn),
    onSuccess: () => {
      notifySuccess('Training started');
      qc.invalidateQueries({ queryKey: ['experiments'] });
      qc.invalidateQueries({ queryKey: ['training', 'queue'] });
      setSelectedDataset('');
      setTargetColumn('');
    },
    onError: (err) => notifyError('Failed to start training', getErrorMessage(err)),
  });

  const selectedDatasetMeta = datasets?.find((d: any) => d.name === selectedDataset || d.filename === selectedDataset);

  return (
    <PageContainer>
      <PageHeader title="Training" description="Train machine learning models on your datasets">
        <Button variant="secondary" onClick={() => expRefetch()} icon={<Clock className="w-4 h-4" />}>Refresh</Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader><CardTitle>New Training Job</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {datasetsLoading ? (
                <LoadingSpinner />
              ) : !datasets || datasets.length === 0 ? (
                <EmptyState title="No datasets" description="Upload a dataset first" />
              ) : (
                <>
                  <Select
                    label="Dataset"
                    placeholder="Select a dataset"
                    value={selectedDataset}
                    onChange={(e) => { setSelectedDataset(e.target.value); setTargetColumn(''); }}
                    options={(datasets as any[]).map((d: any) => ({ value: d.name || d.filename, label: d.filename || d.name }))}
                  />
                  {(selectedDatasetMeta as any)?.column_details && (
                    <Select
                      label="Target Column"
                      placeholder="Select target column"
                      value={targetColumn}
                      onChange={(e) => setTargetColumn(e.target.value)}
                      options={((selectedDatasetMeta as any)?.column_details || []).map((c: any) => ({ value: c.name, label: c.name }))}
                    />
                  )}
                  {!(selectedDatasetMeta as any)?.column_details && selectedDataset && (
                    <Button variant="secondary" size="sm" onClick={async () => {
                      try {
                        const profile = await datasetsService.profile(selectedDataset);
                        qc.setQueryData(['datasets'], (old: any) => {
                          if (!old) return old;
                          return { ...old, datasets: (old.datasets || []).map((d: any) => d.name === selectedDataset || d.filename === selectedDataset ? { ...d, column_details: profile.column_details } : d) };
                        });
                      } catch {}
                    }}>Load Columns</Button>
                  )}
                  <Button
                    className="w-full"
                    onClick={() => trainingMutation.mutate()}
                    loading={trainingMutation.isPending}
                    disabled={!selectedDataset || !targetColumn}
                    icon={<Brain className="w-4 h-4" />}
                  >
                    Start Training
                  </Button>
                  {trainingMutation.error && <p className="text-xs text-red-400">{getErrorMessage(trainingMutation.error)}</p>}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {queue && queue.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Training Queue</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(queue as any[]).map((job: any) => (
                    <div key={job.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-zinc-200 truncate">{job.experiment_name}</p>
                        <p className="text-xs text-zinc-500">{job.dataset_name} → {job.target_column} · {job.algorithm}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {job.status === 'training' && (
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${job.progress}%` }} />
                            </div>
                            <span className="text-xs text-zinc-500">{job.progress}%</span>
                          </div>
                        )}
                        <StatusBadge status={job.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Experiments</CardTitle>
            </CardHeader>
            <CardContent>
              {expLoading ? (
                <LoadingSpinner />
              ) : expError ? (
                <ErrorState title="Failed to load experiments" message={getErrorMessage(expErr)} onRetry={expRefetch} />
              ) : !experiments || experiments.length === 0 ? (
                <EmptyState
                  icon={<BarChart3 className="w-8 h-8" />}
                  title="No experiments yet"
                  description="Start a training job to see experiments here"
                />
              ) : (
                <div className="space-y-2">
                  {/* Header */}
                  <div className="grid grid-cols-5 gap-4 px-3 py-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    <span className="col-span-2">Name</span>
                    <span>Algorithm</span>
                    <span>Status</span>
                    <span>Duration</span>
                  </div>
                  {(experiments as any[]).map((exp: any) => (
                    <div key={exp.id} className="grid grid-cols-5 gap-4 items-center p-3 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="col-span-2 min-w-0">
                        <p className="text-sm font-medium text-zinc-200 truncate">{exp.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{exp.dataset_name} → {exp.target_column}</p>
                      </div>
                      <div>
                        <Badge variant="info" size="sm">{exp.algorithm}</Badge>
                      </div>
                      <div>
                        <StatusBadge status={exp.status} />
                      </div>
                      <div className="text-sm text-zinc-400">
                        {exp.duration_seconds ? formatDuration(exp.duration_seconds) : '-'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
