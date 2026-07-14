import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Rocket, Globe, Trash2, Power, ExternalLink, Plus } from 'lucide-react';
import { deploymentsService } from '../../../services/deployments.service';
import { modelsService } from '../../../services/models.service';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { PageContainer, PageHeader } from '../../../components/layout/PageContainer';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { Modal } from '../../../components/ui/Modal';
import { Dialog } from '../../../components/ui/Dialog';
import { useNotification } from '../../../hooks/useNotification';
import { staggerContainer, staggerItem } from '../../../lib/animations';
import { formatNumber, timeAgo } from '../../../lib/formatters';
import { getErrorMessage } from '../../../services/http';

export default function DeploymentsPage() {
  const qc = useQueryClient();
  const { notifySuccess, notifyError } = useNotification();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('');
  const [endpointName, setEndpointName] = useState('');

  const { data: deployments, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['deployments'],
    queryFn: () => deploymentsService.list(),
    select: (d) => d.deployments,
  });

  const { data: models } = useQuery({
    queryKey: ['models'],
    queryFn: () => modelsService.list(),
    select: (d) => d.models?.filter((m: any) => m.status === 'ready'),
  });

  const createMutation = useMutation({
    mutationFn: () => deploymentsService.create(selectedModel, endpointName),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deployments'] }); notifySuccess('Deployment created'); setCreateOpen(false); setSelectedModel(''); setEndpointName(''); },
    onError: (err) => notifyError('Failed to create deployment', getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deploymentsService.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deployments'] }); notifySuccess('Deployment deleted'); setDeleteTarget(null); },
    onError: (err) => notifyError('Failed to delete', getErrorMessage(err)),
  });

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Deployments" description="Manage your model endpoints" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-36 rounded-2xl bg-white/5 animate-pulse" />)}
        </div>
      </PageContainer>
    );
  }

  if (isError) {
    return <PageContainer><ErrorState title="Failed to load deployments" message={getErrorMessage(error)} onRetry={refetch} /></PageContainer>;
  }

  return (
    <PageContainer>
      <PageHeader title="Deployments" description="Manage your model endpoints">
        <Button onClick={() => setCreateOpen(true)} icon={<Rocket className="w-4 h-4" />}>New Deployment</Button>
      </PageHeader>

      {deployments && deployments.length === 0 ? (
        <EmptyState
          icon={<Globe className="w-8 h-8" />}
          title="No deployments"
          description="Deploy a trained model to create an API endpoint"
          action={{ label: 'Create Deployment', onClick: () => setCreateOpen(true) }}
        />
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-4 md:grid-cols-2">
          {(deployments as any[]).map((dep: any) => (
            <motion.div key={dep.id} variants={staggerItem}>
              <Card padding="md">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                      <Rocket className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-100">{dep.endpoint_name}</h3>
                      <p className="text-xs text-zinc-500">{dep.model_name}</p>
                    </div>
                  </div>
                  <StatusBadge status={dep.status} />
                </div>
                <div className="flex items-center gap-4 text-xs text-zinc-500 mb-3">
                  <span>{formatNumber(dep.requests_total)} requests</span>
                  <span>{dep.avg_latency_ms}ms avg latency</span>
                  <span>v{dep.version}</span>
                </div>
                {dep.endpoint_url && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 text-xs font-mono text-zinc-400 truncate mb-3">
                    <Globe className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{dep.endpoint_url}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => {}} icon={<ExternalLink className="w-3 h-3" />}>
                    Test Endpoint
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(dep.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3" /></Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Deployment" description="Deploy a model to a new API endpoint">
        <div className="space-y-4">
          <Select
            label="Model"
            placeholder="Select a model"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            options={(models || []).map((m: any) => ({ value: m.name, label: `${m.name} (${m.algorithm})` }))}
          />
          <Input
            label="Endpoint Name"
            value={endpointName}
            onChange={(e) => setEndpointName(e.target.value)}
            placeholder="my-model-endpoint"
            helperText="Lowercase letters, numbers, and hyphens only"
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} loading={createMutation.isPending} disabled={!selectedModel || !endpointName}>Deploy</Button>
          </div>
        </div>
      </Modal>

      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        title="Delete Deployment"
        message="Are you sure you want to delete this deployment? The endpoint will be removed."
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
      />
    </PageContainer>
  );
}
