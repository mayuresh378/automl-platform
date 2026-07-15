import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { datasetsService } from '../../../services/datasets.service';
import { PageContainer, PageHeader } from '../../../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { Tabs } from '../../../components/ui/Tabs';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import type { DatasetAnalysisResult } from '../../../types/api';

const severityColor = (s: string | undefined) => {
  if (s === 'high') return 'error';
  if (s === 'medium') return 'warning';
  if (s === 'low') return 'success';
  return 'default';
};

const priorityColor = (p: string | undefined) => {
  if (p === 'high') return 'error';
  if (p === 'medium') return 'warning';
  if (p === 'low') return 'info';
  return 'default';
};

function StatCard({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="text-center p-3 rounded-xl bg-white/5">
      <p className="text-lg font-semibold text-zinc-100">{value ?? '-'}</p>
      <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
    </div>
  );
}

function ScoreGauge({ score, grade }: { score: number; grade: string }) {
  const hue = score >= 90 ? 142 : score >= 80 ? 48 : score >= 65 ? 38 : score >= 50 ? 15 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.5" fill="none" stroke={`hsl(${hue}, 70%, 50%)`} strokeWidth="3"
            strokeDasharray={`${score * 0.31} 31`} strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-zinc-100">{grade}</span>
      </div>
      <div>
        <p className="text-xs text-zinc-500">Quality Score</p>
        <p className="text-lg font-semibold text-zinc-100">{score}/100</p>
      </div>
    </div>
  );
}

const OVERVIEW_TAB = 'overview';
const QUALITY_TAB = 'quality';
const RECS_TAB = 'recommendations';
const CORRELATION_TAB = 'correlation';

const analysisTabs = [
  { id: OVERVIEW_TAB, label: 'Overview' },
  { id: QUALITY_TAB, label: 'Data Quality' },
  { id: RECS_TAB, label: 'Recommendations' },
  { id: CORRELATION_TAB, label: 'Correlation' },
];

function AnalysisContent({ data }: { data: DatasetAnalysisResult }) {
  const [tab, setTab] = useState(OVERVIEW_TAB);
  const d = data;
  const ft = d.feature_types;
  const qs = d.quality_score;

  return (
    <div className="text-zinc-200">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Rows" value={d.rows} />
        <StatCard label="Columns" value={d.columns} />
        <StatCard label="Target" value={d.target} />
        <ScoreGauge score={qs?.total ?? 0} grade={qs?.grade ?? '-'} />
      </div>

      <Tabs tabs={analysisTabs} activeTab={tab} onChange={setTab} className="mb-6" />

      {tab === OVERVIEW_TAB && (
        <div className="space-y-6">
          {ft && Object.keys(ft).length > 0 && (
            <Card>
              <CardHeader><CardTitle>Feature Types</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(ft).map(([type, cols]) => (
                    <div key={type} className="px-3 py-2 rounded-lg bg-white/5">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{type}</p>
                      <p className="text-sm text-zinc-200">{Array.isArray(cols) ? cols.join(', ') : String(cols)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {Array.isArray(d.insights) && d.insights.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Insights</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {d.insights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-1 shrink-0">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {d.target_detection && Array.isArray(d.target_detection.candidates) && d.target_detection.candidates.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Target Candidates</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {d.target_detection.candidates.map((c, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5">
                      <div>
                        <span className="text-sm font-medium text-zinc-200">{c.column}</span>
                        <span className="text-xs text-zinc-500 ml-2">{c.reason}</span>
                      </div>
                      <Badge variant={c.score >= 7 ? 'success' : c.score >= 4 ? 'warning' : 'default'}>
                        {c.score}/10
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {tab === QUALITY_TAB && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader><CardTitle>Missing Data</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-400">{d.missing?.total_missing ?? 0} values</span>
                  <Badge variant={severityColor(d.missing?.severity)}>
                    {d.missing?.missing_pct ?? 0}%
                  </Badge>
                </div>
                {Array.isArray(d.missing?.columns) && d.missing.columns.length > 0 && (
                  <div className="space-y-1 mt-3">
                    {d.missing.columns.slice(0, 5).map((col, i) => (
                      <div key={i} className="flex justify-between text-xs text-zinc-500">
                        <span>{col.column}</span>
                        <span>{col.missing} ({col.pct}%)</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Duplicates</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-400">{d.duplicates?.count ?? 0} rows</span>
                  <Badge variant={severityColor(d.duplicates?.severity)}>
                    {d.duplicates?.pct ?? 0}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Outliers</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-400">{d.outliers?.total_outliers ?? 0} total</span>
                  <Badge variant={d.outliers?.mean_pct != null && d.outliers.mean_pct > 5 ? 'warning' : 'success'}>
                    {d.outliers?.mean_pct ?? 0}% avg
                  </Badge>
                </div>
                {Array.isArray(d.outliers?.columns) && d.outliers.columns.length > 0 && (
                  <div className="space-y-1 mt-3">
                    {d.outliers.columns.slice(0, 5).map((col, i) => (
                      <div key={i} className="flex justify-between text-xs text-zinc-500">
                        <span>{col.column}</span>
                        <span>{col.outliers} ({col.pct}%)</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {d.class_imbalance?.detected && (
            <Card>
              <CardHeader>
                <CardTitle>Class Imbalance</CardTitle>
                <Badge variant={severityColor(d.class_imbalance.severity)}>
                  {d.class_imbalance.severity}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-400 mb-2">
                  Target: {d.class_imbalance.target} — Ratio: {d.class_imbalance.imbalance_ratio}x — Classes: {d.class_imbalance.classes}
                </p>
                {d.class_imbalance.distribution && (
                  <div className="space-y-1">
                    {Object.entries(d.class_imbalance.distribution).map(([cls, info]) => (
                      <div key={cls} className="flex items-center gap-3 text-sm">
                        <span className="w-20 truncate text-zinc-300">{cls}</span>
                        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(info.pct, 100)}%` }} />
                        </div>
                        <span className="text-xs text-zinc-500 w-16 text-right">{info.pct}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {Array.isArray(qs?.deductions) && qs.deductions.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Score Deductions</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {qs.deductions.map((d, i) => (
                    <li key={i} className="text-sm text-red-400">- {d}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {tab === RECS_TAB && Array.isArray(d.recommendations) && (
        <div className="space-y-3">
          {d.recommendations.length === 0 ? (
            <Card><CardContent><p className="text-sm text-zinc-500 text-center py-4">No recommendations</p></CardContent></Card>
          ) : (
            d.recommendations.map((rec, i) => (
              <Card key={i}>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <Badge variant={priorityColor(rec.priority)} size="sm">
                      {rec.priority}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-200">{rec.message}</p>
                      {Array.isArray(rec.columns) && rec.columns.length > 0 && (
                        <p className="text-xs text-zinc-500 mt-1">
                          Columns: {rec.columns.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === CORRELATION_TAB && (
        <div className="space-y-6">
          {d.correlation?.size != null && d.correlation.size >= 2 ? (
            <>
              {Array.isArray(d.correlation.top_correlations) && d.correlation.top_correlations.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Top Correlations</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {d.correlation.top_correlations.slice(0, 10).map((pair, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          <span className="text-zinc-300 w-32 truncate">{pair.x}</span>
                          <span className="text-zinc-500">vs</span>
                          <span className="text-zinc-300 w-32 truncate">{pair.y}</span>
                          <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                            <div className="h-full rounded-full" style={{
                              width: `${Math.abs(pair.value) * 100}%`,
                              backgroundColor: pair.value >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
                            }} />
                          </div>
                          <span className="text-xs text-zinc-500 w-12 text-right font-mono">
                            {pair.value.toFixed(3)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent>
                <p className="text-sm text-zinc-500 text-center py-4">
                  {d.correlation?.message ?? 'Need at least 2 numeric columns for correlation analysis'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

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

  const { data: analysis, isLoading: analysisLoading, isError: analysisError } = useQuery({
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
            <>
              <div className="text-zinc-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <StatCard label="Rows" value={profile?.rows} />
                  <StatCard label="Columns" value={profile?.columns} />
                  <StatCard label="Missing" value={profile?.missing_values} />
                  <StatCard label="Duplicates" value={profile?.duplicates} />
                </div>
              </div>
              {analysisLoading && <LoadingSpinner />}
              {analysisError && !analysisLoading && (
                <Card>
                  <CardContent>
                    <p className="text-sm text-red-400 text-center py-4">Failed to load analysis</p>
                  </CardContent>
                </Card>
              )}
              {analysis && !analysisLoading && <AnalysisContent data={analysis} />}
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}