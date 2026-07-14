import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Brain, Trash2, Eye, Archive, Search, Star } from 'lucide-react';
import { modelsService } from '../../../services/models.service';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { PageContainer, PageHeader } from '../../../components/layout/PageContainer';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { Dialog } from '../../../components/ui/Dialog';
import { useNotification } from '../../../hooks/useNotification';
import { useUIStore } from '../../../store/useUIStore';
import { staggerContainer, staggerItem } from '../../../lib/animations';
import { timeAgo } from '../../../lib/formatters';
import { getErrorMessage } from '../../../services/http';

export default function ModelRegistryPage() {
  const qc = useQueryClient();
  const setActivePage = useUIStore((s) => s.setActivePage);
  const { notifySuccess, notifyError } = useNotification();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: models, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['models'],
    queryFn: () => modelsService.list(),
    select: (d) => d.models,
  });

  const deleteMutation = useMutation({
    mutationFn: (name: string) => modelsService.remove(name),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['models'] }); notifySuccess('Model deleted'); setDeleteTarget(null); },
    onError: (err) => notifyError('Failed to delete', getErrorMessage(err)),
  });

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Model Registry" description="Browse and manage your trained models" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      </PageContainer>
    );
  }

  if (isError) {
    return <PageContainer><ErrorState title="Failed to load models" message={getErrorMessage(error)} onRetry={refetch} /></PageContainer>;
  }

  const filtered = (models || []).filter((m: any) =>
    m.name.toLowerCase().includes(search.toLowerCase()) || m.algorithm?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageContainer>
      <PageHeader title="Model Registry" description="Browse and manage your trained models">
        <Input
          placeholder="Search models..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
          className="w-64"
        />
      </PageHeader>

      {filtered.length === 0 ? (
        models && models.length > 0 ? (
          <EmptyState title="No models match your search" />
        ) : (
          <EmptyState
            icon={<Brain className="w-8 h-8" />}
            title="No models yet"
            description="Train a model to see it appear here"
            action={{ label: 'Go to Training', onClick: () => setActivePage('Training') }}
          />
        )
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((model: any) => (
            <motion.div key={model.id} variants={staggerItem}>
              <Card hover padding="md" className="h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-purple-400" />
                  </div>
                  <StatusBadge status={model.status} />
                </div>
                <h3 className="text-sm font-semibold text-zinc-100 mb-1 truncate">{model.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="info" size="sm">{model.algorithm}</Badge>
                  <span className="text-xs text-zinc-500">v{model.version}</span>
                </div>
                <div className="mt-auto space-y-1 text-xs text-zinc-500">
                  <p>Dataset: {model.dataset_name}</p>
                  <p>Target: {model.target_column}</p>
                  <p>Trained: {timeAgo(model.created_at)}</p>
                </div>
                {model.metrics && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex gap-3">
                    {model.metrics.accuracy != null && <div><span className="text-xs text-zinc-500">Accuracy</span><p className="text-sm font-medium text-zinc-200">{(model.metrics.accuracy * 100).toFixed(1)}%</p></div>}
                    {model.metrics.f1_score != null && <div><span className="text-xs text-zinc-500">F1</span><p className="text-sm font-medium text-zinc-200">{(model.metrics.f1_score * 100).toFixed(1)}%</p></div>}
                    {model.metrics.rmse != null && <div><span className="text-xs text-zinc-500">RMSE</span><p className="text-sm font-medium text-zinc-200">{model.metrics.rmse.toFixed(3)}</p></div>}
                  </div>
                )}
                <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => setActivePage('Deployment')} icon={<Eye className="w-3 h-3" />}>Deploy</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setDeleteTarget(model.name); }} className="text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3" /></Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        title="Delete Model"
        message={`Are you sure you want to delete "${deleteTarget}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
      />
    </PageContainer>
  );
}
