import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Sparkles, Eraser, Search, AlertTriangle } from 'lucide-react';
import { datasetsService } from '../../../services/datasets.service';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Card as CardUI } from '../../../components/ui/Card';
import { PageContainer, PageHeader, PageSection } from '../../../components/layout/PageContainer';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { useNotification } from '../../../hooks/useNotification';
import { getErrorMessage } from '../../../services/http';

export default function CleaningPage() {
  const qc = useQueryClient();
  const { notifySuccess, notifyError } = useNotification();
  const [selectedDataset, setSelectedDataset] = useState('');

  const { data: datasets, isLoading } = useQuery({
    queryKey: ['datasets'],
    queryFn: () => datasetsService.list(),
    select: (d) => d.datasets,
  });

  const autoCleanMutation = useMutation({
    mutationFn: () => datasetsService.autoClean(selectedDataset),
    onSuccess: () => { notifySuccess('Auto-cleaning completed'); qc.invalidateQueries({ queryKey: ['datasets'] }); },
    onError: (err) => notifyError('Cleaning failed', getErrorMessage(err)),
  });

  return (
    <PageContainer>
      <PageHeader title="Data Cleaning" description="Clean and prepare your datasets" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader><CardTitle>Dataset</CardTitle></CardHeader>
            <CardContent>
              <Select
                placeholder="Select dataset"
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                options={(datasets || []).map((d: any) => ({ value: d.name || d.filename, label: d.filename || d.name }))}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" size="sm" variant="secondary" disabled={!selectedDataset} icon={<Eraser className="w-4 h-4" />}>Remove Duplicates</Button>
              <Button className="w-full" size="sm" variant="secondary" disabled={!selectedDataset} icon={<AlertTriangle className="w-4 h-4" />}>Handle Missing Values</Button>
              <Button className="w-full" size="sm" variant="premium" disabled={!selectedDataset} loading={autoCleanMutation.isPending} onClick={() => autoCleanMutation.mutate()} icon={<Sparkles className="w-4 h-4" />}>
                Auto-Clean
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {!selectedDataset ? (
            <EmptyState icon={<Eraser className="w-8 h-8" />} title="Select a dataset" description="Choose a dataset from the sidebar to start cleaning" />
          ) : (
            <Card>
              <CardHeader><CardTitle>Cleaning Results</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-500">Select cleaning operations and apply them to your dataset. Connect to the backend for full functionality.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
