import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Eraser, AlertTriangle, CheckCircle2, RotateCcw, FileText, Download } from 'lucide-react';
import { datasetsService } from '../../../services/datasets.service';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { PageContainer, PageHeader } from '../../../components/layout/PageContainer';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { useNotification } from '../../../hooks/useNotification';
import { getErrorMessage, downloadUrl } from '../../../services/http';

export default function CleaningPage() {
  const { notifySuccess, notifyError } = useNotification();
  const [selectedDataset, setSelectedDataset] = useState('');
  const [result, setResult] = useState<any>(null);

  const { data: datasets, isLoading, isError, error } = useQuery({
    queryKey: ['datasets'],
    queryFn: () => datasetsService.list(),
    select: (d: any) => d.datasets,
  });

  const runClean = (type: string, extra: Record<string, any> = {}) => {
    if (!selectedDataset) return;
    const ops = [{ type, ...extra }];
    datasetsService.clean(selectedDataset, ops).then((data: any) => {
      setResult(data);
      notifySuccess('Cleaning completed');
    }).catch((err) => {
      notifyError('Cleaning failed', getErrorMessage(err));
    });
  };

  const runAutoClean = () => {
    if (!selectedDataset) return;
    datasetsService.autoClean(selectedDataset).then((data: any) => {
      setResult(data);
      notifySuccess('Auto-cleaning completed');
    }).catch((err) => {
      notifyError('Cleaning failed', getErrorMessage(err));
    });
  };

  const datasetOptions = (datasets || []).map((d: any) => ({
    value: d.name || d.filename,
    label: d.filename || d.name,
  }));

  const busy = false;

  return (
    <PageContainer>
      <PageHeader title="Data Cleaning" description="Clean and prepare your datasets" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader><CardTitle>Dataset</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <LoadingSpinner />
                  <span>Loading datasets...</span>
                </div>
              ) : isError ? (
                <div className="text-sm text-red-400">
                  Failed to load datasets: {getErrorMessage(error)}
                </div>
              ) : (
                <Select
                  placeholder="Select dataset"
                  value={selectedDataset}
                  onChange={(e) => { setSelectedDataset(e.target.value); setResult(null); }}
                  options={datasetOptions}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full" size="sm" variant="secondary"
                disabled={!selectedDataset}
                icon={<Eraser className="w-4 h-4" />}
                onClick={() => runClean('remove_duplicates')}
              >
                Remove Duplicates
              </Button>
              <Button
                className="w-full" size="sm" variant="secondary"
                disabled={!selectedDataset}
                icon={<AlertTriangle className="w-4 h-4" />}
                onClick={() => runClean('impute_missing', { strategy: 'median' })}
              >
                Handle Missing Values
              </Button>
              <Button
                className="w-full" size="sm" variant="premium"
                disabled={!selectedDataset}
                icon={<Sparkles className="w-4 h-4" />}
                onClick={() => runAutoClean()}
              >
                Auto-Clean
              </Button>
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
                <Badge variant="success" dot>Cleaned</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.summary && Object.entries(result.summary).filter(([, v]: any) => v > 0).map(([key, val]: any) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">{key.replace(/_/g, ' ')}</span>
                    <Badge variant="info">{val}</Badge>
                  </div>
                ))}
                {!result.summary && result.applied_operations && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Operations applied</span>
                    <Badge variant="info">{result.applied_operations.length}</Badge>
                  </div>
                )}
                <div className="pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Cleaned file</span>
                    <span className="text-zinc-200 truncate ml-2">{result.cleaned_file}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-3 space-y-4">
          {!selectedDataset ? (
            <EmptyState
              icon={<FileText className="w-8 h-8" />}
              title="Select a dataset"
              description="Choose a dataset from the left sidebar to start cleaning"
            />
          ) : result ? (
            <>
              {(result.rows_before !== undefined || result.columns_before !== undefined) && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="text-center">
                      <p className="text-2xl font-bold text-zinc-100">{result.rows_before ?? '-'}</p>
                      <p className="text-xs text-zinc-500 mt-1">Rows Before</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="text-center">
                      <p className="text-2xl font-bold text-zinc-100">{result.rows_after ?? '-'}</p>
                      <p className="text-xs text-zinc-500 mt-1">Rows After</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="text-center">
                      <p className="text-2xl font-bold text-zinc-100">{result.columns_before ?? '-'}</p>
                      <p className="text-xs text-zinc-500 mt-1">Columns Before</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="text-center">
                      <p className="text-2xl font-bold text-zinc-100">{result.columns_after ?? '-'}</p>
                      <p className="text-xs text-zinc-500 mt-1">Columns After</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {result.applied_operations && result.applied_operations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Applied Operations</CardTitle>
                    <Badge variant="success">{result.applied_operations.length} operations</Badge>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1.5">
                      {result.applied_operations.map((op: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          {op}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {result.column_changes && result.column_changes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Column Changes</CardTitle>
                    <Badge variant="info">{result.column_changes.length} columns</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/5">
                            <th className="text-left py-2 pr-4 text-zinc-500 font-medium">Column</th>
                            <th className="text-left py-2 pr-4 text-zinc-500 font-medium">Type</th>
                            <th className="text-right py-2 pr-4 text-zinc-500 font-medium">Missing Before</th>
                            <th className="text-right py-2 pr-4 text-zinc-500 font-medium">Missing After</th>
                            <th className="text-right py-2 text-zinc-500 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.column_changes.map((col: any) => (
                            <tr key={col.name} className="border-b border-white/5">
                              <td className="py-2 pr-4 text-zinc-200">{col.name}</td>
                              <td className="py-2 pr-4">
                                <Badge variant="default" size="sm">{col.dtype}</Badge>
                              </td>
                              <td className="py-2 pr-4 text-right text-zinc-300">{col.missing_before}</td>
                              <td className="py-2 pr-4 text-right text-zinc-300">{col.missing_after}</td>
                              <td className="py-2 text-right">
                                {col.removed ? (
                                  <Badge variant="error" size="sm">Removed</Badge>
                                ) : col.missing_after < col.missing_before ? (
                                  <Badge variant="success" size="sm">Cleaned</Badge>
                                ) : (
                                  <Badge variant="default" size="sm">Unchanged</Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end gap-2">
                {result?.cleaned_file && (
                  <Button
                    variant="secondary" size="sm"
                    icon={<Download className="w-4 h-4" />}
                    onClick={() => window.open(downloadUrl(`/datasets/${encodeURIComponent(result.cleaned_file)}/download`), '_blank')}
                  >
                    Download Cleaned File
                  </Button>
                )}
                <Button
                  variant="secondary" size="sm"
                  icon={<RotateCcw className="w-4 h-4" />}
                  onClick={() => setResult(null)}
                >
                  Clear Results
                </Button>
              </div>
            </>
          ) : (
            <EmptyState
              icon={<Sparkles className="w-8 h-8" />}
              title="Ready to clean"
              description="Use the quick actions or auto-clean button to start cleaning your dataset"
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
}
