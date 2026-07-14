import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { PageContainer, PageHeader } from '../../../components/layout/PageContainer';
import { ErrorState } from '../../../components/ui/ErrorState';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { monitoringService } from '../../../services/monitoring.service';
import { ActivityTimeline } from '../../../components/ActivityTimeline';
import { Cpu, HardDrive, Activity, Zap, BarChart3, TrendingUp } from 'lucide-react';
import { formatNumber } from '../../../lib/formatters';
import { getErrorMessage } from '../../../services/http';

export default function MonitoringPage() {
  const { data: metrics, isLoading: mLoading, isError: mError, error: mErr, refetch: mRefetch } = useQuery({
    queryKey: ['monitoring', 'metrics'],
    queryFn: () => monitoringService.metrics(),
  });

  const { data: stats, isLoading: sLoading } = useQuery({
    queryKey: ['monitoring', 'stats'],
    queryFn: () => monitoringService.stats(),
  });

  if (mLoading || sLoading) {
    return (
      <PageContainer>
        <PageHeader title="Monitoring" description="System health and performance" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 rounded-2xl bg-white/5 animate-pulse" />
          <div className="h-64 rounded-2xl bg-white/5 animate-pulse" />
        </div>
      </PageContainer>
    );
  }

  if (mError) {
    return <PageContainer><ErrorState title="Failed to load metrics" message={getErrorMessage(mErr)} onRetry={mRefetch} />;
  }

  return (
    <PageContainer>
      <PageHeader title="Monitoring" description="System health and performance" />

      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'CPU Usage', value: metrics.cpu_percent, icon: <Cpu className="w-5 h-5" />, color: metrics.cpu_percent > 80 ? 'text-red-400' : 'text-emerald-400', bg: metrics.cpu_percent > 80 ? 'from-red-500/20 to-red-600/20' : 'from-emerald-500/20 to-emerald-600/20' },
            { label: 'Memory', value: metrics.memory_percent, icon: <HardDrive className="w-5 h-5" />, color: metrics.memory_percent > 80 ? 'text-red-400' : 'text-emerald-400', bg: metrics.memory_percent > 80 ? 'from-red-500/20 to-red-600/20' : 'from-emerald-500/20 to-emerald-600/20' },
            { label: 'Disk', value: metrics.disk_percent, icon: <Activity className="w-5 h-5" />, color: metrics.disk_percent > 80 ? 'text-red-400' : 'text-emerald-400', bg: metrics.disk_percent > 80 ? 'from-red-500/20 to-red-600/20' : 'from-emerald-500/20 to-emerald-600/20' },
            { label: 'Requests/min', value: metrics.requests_per_minute, icon: <Zap className="w-5 h-5" />, color: 'text-blue-400', bg: 'from-blue-500/20 to-cyan-500/20' },
          ].map((item) => (
            <Card key={item.label} padding="md">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm text-zinc-400">{item.label}</p>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.bg} flex items-center justify-center ${item.color}`}>{item.icon}</div>
              </div>
              <p className={`text-2xl font-bold ${item.color}`}>
                {item.label === 'Requests/min' ? formatNumber(item.value as number) : `${Math.round(item.value)}%`}
              </p>
              <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                {item.label !== 'Requests/min' && (
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(item.value as number, 100)}%`, background: (item.value as number) > 80 ? 'rgb(248, 113, 113)' : 'rgb(52, 211, 153)' }}
                  />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total Models', value: stats.total_models, icon: <BarChart3 className="w-4 h-4" /> },
            { label: 'Datasets', value: stats.total_datasets, icon: <HardDrive className="w-4 h-4" /> },
            { label: 'Experiments', value: stats.total_experiments, icon: <TrendingUp className="w-4 h-4" /> },
            { label: 'Predictions', value: formatNumber(stats.total_predictions), icon: <Zap className="w-4 h-4" /> },
            { label: 'Success Rate', value: `${(stats.success_rate * 100).toFixed(1)}%`, icon: <Activity className="w-4 h-4" /> },
          ].map((item) => (
            <Card key={item.label} padding="sm" className="text-center">
              <div className="flex items-center justify-center gap-2 text-zinc-500 mb-1">{item.icon}<span className="text-xs">{item.label}</span></div>
              <p className="text-lg font-semibold text-zinc-100">{item.value}</p>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>System Activity</CardTitle></CardHeader>
          <CardContent>
            <ActivityTimeline />
          </CardContent>
        </Card>

        {metrics && (
          <Card>
            <CardHeader><CardTitle>Resource Allocation</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'CPU', used: metrics.cpu_percent, total: 100, color: metrics.cpu_percent > 80 ? 'bg-red-500' : metrics.cpu_percent > 50 ? 'bg-amber-500' : 'bg-emerald-500' },
                { label: 'Memory', used: metrics.memory_percent, total: 100, color: metrics.memory_percent > 80 ? 'bg-red-500' : metrics.memory_percent > 50 ? 'bg-amber-500' : 'bg-emerald-500' },
                { label: 'Disk', used: metrics.disk_percent, total: 100, color: metrics.disk_percent > 80 ? 'bg-red-500' : metrics.disk_percent > 50 ? 'bg-amber-500' : 'bg-emerald-500' },
              ].map((res) => (
                <div key={res.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-zinc-300">{res.label}</span>
                    <span className="text-zinc-500">{Math.round(res.used)}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${res.color}`} style={{ width: `${res.used}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
