import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Table, Search, Filter } from 'lucide-react';
import { datasetsService } from '../../../services/datasets.service';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { PageContainer, PageHeader } from '../../../components/layout/PageContainer';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { Pagination } from '../../../components/ui/Pagination';
import { getErrorMessage } from '../../../services/http';

export default function ExplorerPage() {
  const [selectedDataset, setSelectedDataset] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 50;

  const { data: datasets } = useQuery({
    queryKey: ['datasets'],
    queryFn: () => datasetsService.list(),
    select: (d) => d.datasets,
  });

  const { data: preview, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['dataset', selectedDataset, 'preview', limit, offset],
    queryFn: () => datasetsService.preview(selectedDataset, limit, offset),
    enabled: !!selectedDataset,
  });

  return (
    <PageContainer>
      <PageHeader title="Data Explorer" description="Browse and inspect your datasets" />

      <div className="mb-6">
        <Select
          placeholder="Select a dataset"
          value={selectedDataset}
          onChange={(e) => { setSelectedDataset(e.target.value); setOffset(0); }}
          options={(datasets || []).map((d: any) => ({ value: d.name || d.filename, label: d.filename || d.name }))}
        />
      </div>

      {!selectedDataset ? (
        <EmptyState icon={<Table className="w-8 h-8" />} title="Select a dataset" description="Choose a dataset to explore its contents" />
      ) : isLoading ? (
        <LoadingSpinner size="lg" />
      ) : isError ? (
        <ErrorState title="Failed to load data" message={getErrorMessage(error)} onRetry={refetch} />
      ) : preview ? (
        <Card>
          <CardHeader>
            <CardTitle>{selectedDataset}</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">{preview.total} rows · {preview.columns?.length || 0} columns</span>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {(!preview.rows || preview.rows.length === 0) ? (
              <p className="text-sm text-zinc-500 text-center py-8">No data to display</p>
            ) : (
              <>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {preview.columns.map((col: string) => (
                        <th key={col} className="px-3 py-2 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                          {col}
                          {preview.dtypes?.[col] && <span className="text-zinc-600 font-normal ml-1">({preview.dtypes[col]})</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((row: any, i: number) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                        {preview.columns.map((col: string) => (
                          <td key={col} className="px-3 py-2 text-zinc-300 whitespace-nowrap">
                            {row[col] != null ? String(row[col]) : <span className="text-zinc-600 italic">NULL</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Pagination
                  currentPage={Math.floor(offset / limit) + 1}
                  totalPages={Math.ceil(preview.total / limit)}
                  onPageChange={(page) => setOffset((page - 1) * limit)}
                />
              </>
            )}
          </CardContent>
        </Card>
      ) : null}
    </PageContainer>
  );
}
