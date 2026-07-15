import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { datasetsService } from '../../../services/datasets.service';
import { PageContainer, PageHeader } from '../../../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Select } from '../../../components/ui/Select';
import { LoadingSpinner } from '../../../components/LoadingSpinner';

export default function DatasetAnalysisPage() {
  const [selectedDataset, setSelectedDataset] = useState('');

  const { data: datasets } = useQuery({
    queryKey: ['datasets'],
    queryFn: () => datasetsService.list(),
    select: (d: any) => d.datasets,
  });

  const { data: profile, isLoading: profileLoading, isError: profileError, error: profileErr } = useQuery({
    queryKey: ['dataset', selectedDataset, 'profile'],
    queryFn: () => datasetsService.profile(selectedDataset),
    enabled: !!selectedDataset,
  });

  const { data: analysis, isLoading: analysisLoading } = useQuery({
    queryKey: ['dataset', selectedDataset, 'analysis'],
    queryFn: () => datasetsService.analyze(selectedDataset),
    enabled: !!selectedDataset,
  });

  return (
    <PageContainer>
      <PageHeader title="Dataset Analysis" description="Analyze and understand your data" />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Select
                placeholder="Select dataset"
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                options={(datasets || []).map((d: any) => ({ value: d.name || d.filename, label: d.filename || d.name }))}
              />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3 space-y-6">
          {!selectedDataset ? (
            <div className="text-zinc-400 text-center py-16">Select a dataset to begin analysis</div>
          ) : profileLoading || (!profile && !profileError) ? (
            <LoadingSpinner size="lg" />
          ) : profileError ? (
            <div className="text-red-400 text-center py-16">Failed to load profile</div>
          ) : (
            <div className="text-zinc-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 rounded-xl bg-white/5">
                  <p className="text-lg font-semibold text-zinc-100">{profile?.rows ?? '-'}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Rows</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/5">
                  <p className="text-lg font-semibold text-zinc-100">{profile?.columns ?? '-'}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Columns</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/5">
                  <p className="text-lg font-semibold text-zinc-100">{profile?.missing_values ?? '-'}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Missing</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/5">
                  <p className="text-lg font-semibold text-zinc-100">{profile?.duplicates ?? '-'}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Duplicates</p>
                </div>
              </div>
              {analysisLoading && <LoadingSpinner />}
              {analysis && (
                <div>
                  <p>Target: {analysis.target}</p>
                  <p>Type: {analysis.problem_type}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
