import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Lightbulb } from 'lucide-react';
import { datasetsService } from '../../../services/datasets.service';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { PageContainer, PageHeader } from '../../../components/layout/PageContainer';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { getErrorMessage } from '../../../services/http';

export default function DatasetAnalysisPage() {
  const [selectedDataset, setSelectedDataset] = useState('');
  const [targetColumn, setTargetColumn] = useState('');

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
    queryKey: ['dataset', selectedDataset, 'analysis', targetColumn],
    queryFn: () => datasetsService.analyze(selectedDataset, targetColumn || undefined),
    enabled: !!selectedDataset,
  });

  const colDetails: any[] = profile?.column_details || [];

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
                onChange={(e) => { setSelectedDataset(e.target.value); setTargetColumn(''); }}
                options={(datasets || []).map((d: any) => ({ value: d.name || d.filename, label: d.filename || d.name }))}
              />
              {colDetails.length > 0 && (
                <Select
                  placeholder="Target column (optional)"
                  value={targetColumn}
                  onChange={(e) => setTargetColumn(e.target.value)}
                  options={colDetails.map((c: any) => ({ value: c.name, label: c.name }))}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {!selectedDataset ? (
            <EmptyState icon={<BarChart3 className="w-8 h-8" />} title="Select a dataset" description="Choose a dataset to analyze" />
          ) : profileLoading ? (
            <LoadingSpinner size="lg" />
          ) : profileError ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-red-400 text-sm">Failed to load profile: {getErrorMessage(profileErr)}</p>
            </div>
          ) : profile ? (
            <>
              <Card>
                <CardHeader><CardTitle>Dataset Profile</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'Rows', value: profile.rows?.toLocaleString() ?? '0' },
                      { label: 'Columns', value: profile.columns ?? '0' },
                      { label: 'Missing Cells', value: profile.missing_values?.toLocaleString() ?? '0' },
                      { label: 'Duplicate Rows', value: profile.duplicates?.toLocaleString() ?? '0' },
                    ].map((item) => (
                      <div key={item.label} className="text-center p-3 rounded-xl bg-white/5">
                        <p className="text-lg font-semibold text-zinc-100">{item.value}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{item.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="px-3 py-2 text-left text-xs font-medium text-zinc-400 uppercase">Column</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-zinc-400 uppercase">Type</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-zinc-400 uppercase">Missing</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-zinc-400 uppercase">Unique</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-zinc-400 uppercase">Mean</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-zinc-400 uppercase">Std</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-zinc-400 uppercase">Min</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-zinc-400 uppercase">Max</th>
                        </tr>
                      </thead>
                      <tbody>
                        {colDetails.map((col: any) => (
                          <tr key={col.name} className="border-b border-white/5 hover:bg-white/[0.02]">
                            <td className="px-3 py-2 text-zinc-200 font-medium">{col.name}</td>
                            <td className="px-3 py-2"><Badge variant="info" size="sm">{col.dtype}</Badge></td>
                            <td className="px-3 py-2 text-zinc-300">{col.missing ?? 0}</td>
                            <td className="px-3 py-2 text-zinc-300">{col.unique_values ?? '-'}</td>
                            <td className="px-3 py-2 text-zinc-300">{col.mean != null ? col.mean.toFixed(3) : '-'}</td>
                            <td className="px-3 py-2 text-zinc-300">{col.std != null ? col.std.toFixed(3) : '-'}</td>
                            <td className="px-3 py-2 text-zinc-300">{col.min != null ? col.min.toFixed(2) : '-'}</td>
                            <td className="px-3 py-2 text-zinc-300">{col.max != null ? col.max.toFixed(2) : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {analysisLoading && profile && (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              )}

              {analysis && (
                <Card>
                  <CardHeader><CardTitle>Analysis Results</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={analysis.problem_type === 'classification' ? 'info' : 'success'}>
                        {analysis.problem_type === 'classification' ? 'Classification' : 'Regression'}
                      </Badge>
                      {analysis.target && <span className="text-sm text-zinc-400">Target: {analysis.target}</span>}
                    </div>

                    {analysis.recommendations && analysis.recommendations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-1.5">
                          <Lightbulb className="w-4 h-4 text-amber-400" /> Recommendations
                        </h4>
                        <ul className="space-y-1">
                          {analysis.recommendations.map((r: string, i: number) => (
                            <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                              <span className="text-primary mt-0.5">•</span> {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysis.feature_importance && Object.keys(analysis.feature_importance).length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-primary" /> Feature Importance
                        </h4>
                        <div className="space-y-1">
                          {Object.entries(analysis.feature_importance)
                            .sort(([, a]: any, [, b]: any) => b - a)
                            .slice(0, 10)
                            .map(([feature, importance]: any) => (
                              <div key={feature} className="flex items-center gap-3">
                                <span className="text-sm text-zinc-300 w-32 truncate">{feature}</span>
                                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" style={{ width: `${Math.max(importance * 100, 1)}%` }} />
                                </div>
                                <span className="text-xs text-zinc-500 w-12 text-right">{(importance * 100).toFixed(1)}%</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          ) : null}
        </div>
      </div>
    </PageContainer>
  );
}
