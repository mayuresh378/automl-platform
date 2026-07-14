import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Activity, Database, Box, Rocket, TrendingUp, Clock, Brain, Cpu } from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';
import { useUIStore } from '../../../store/useUIStore';
import { monitoringService } from '../../../services/monitoring.service';
import { projectsService } from '../../../services/projects.service';
import { datasetsService } from '../../../services/datasets.service';
import { modelsService } from '../../../services/models.service';
import { deploymentsService } from '../../../services/deployments.service';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../../components/ui/Card';
import { PageContainer, PageHeader } from '../../../components/layout/PageContainer';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { ErrorState } from '../../../components/ui/ErrorState';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { ActivityTimeline } from '../../../components/ActivityTimeline';
import { AnimatedCounter } from '../../../components/AnimatedCounter';
import { staggerContainer, staggerItem } from '../../../lib/animations';
import { formatNumber } from '../../../lib/formatters';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const setActivePage = useUIStore((s) => s.setActivePage);

  const projects = useQuery({ queryKey: ['projects'], queryFn: () => projectsService.list(), select: (d) => d.projects });
  const datasets = useQuery({ queryKey: ['datasets'], queryFn: () => datasetsService.list(), select: (d) => d.datasets });
  const models = useQuery({ queryKey: ['models'], queryFn: () => modelsService.list(), select: (d) => d.models });
  const deployments = useQuery({ queryKey: ['deployments'], queryFn: () => deploymentsService.list(), select: (d) => d.deployments });
  const metrics = useQuery({ queryKey: ['monitoring', 'metrics'], queryFn: () => monitoringService.metrics() });

  const isLoading = projects.isLoading || datasets.isLoading || models.isLoading || deployments.isLoading;
  const isError = projects.isError || datasets.isError || models.isError || deployments.isError;

  if (isLoading) {
    return (
      <PageContainer>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 rounded-2xl bg-white/5 animate-pulse" />
          <div className="h-80 rounded-2xl bg-white/5 animate-pulse" />
        </div>
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer>
        <ErrorState title="Failed to load dashboard" onRetry={() => { projects.refetch(); datasets.refetch(); models.refetch(); deployments.refetch(); }} />
      </PageContainer>
    );
  }

  const stats = [
    { label: 'Projects', value: projects.data?.length || 0, icon: <Box className="w-5 h-5" />, color: 'from-blue-500/20 to-blue-600/20 text-blue-400', onClick: () => setActivePage('Projects') },
    { label: 'Datasets', value: datasets.data?.length || 0, icon: <Database className="w-5 h-5" />, color: 'from-emerald-500/20 to-emerald-600/20 text-emerald-400', onClick: () => setActivePage('Datasets') },
    { label: 'Models', value: models.data?.length || 0, icon: <Brain className="w-5 h-5" />, color: 'from-purple-500/20 to-purple-600/20 text-purple-400', onClick: () => setActivePage('Models') },
    { label: 'Deployments', value: deployments.data?.length || 0, icon: <Rocket className="w-5 h-5" />, color: 'from-amber-500/20 to-amber-600/20 text-amber-400', onClick: () => setActivePage('Deployment') },
  ];

  const recentModels = (models.data || []).slice(0, 5);
  const recentDeployments = (deployments.data || []).slice(0, 5);

  const m = metrics.data as any;

  const chartData = Array.from({ length: 12 }, (_, i) => ({
    time: `${i * 2}h`,
    value: 40 + Math.sin(i * 0.8) * 20 + Math.cos(i * 0.3) * 10 + (i % 3 === 0 ? 5 : 0),
  }));

  return (
    <PageContainer>
      <PageHeader title={`Welcome${user?.name ? `, ${user.name}` : ''}`} description="Here's an overview of your AutoML platform">
        <Button variant="secondary" onClick={() => setActivePage('Training')} icon={<Brain className="w-4 h-4" />}>New Training</Button>
        <Button onClick={() => setActivePage('Datasets')} icon={<Database className="w-4 h-4" />}>Upload Dataset</Button>
      </PageHeader>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={staggerItem}>
            <Card hover className="cursor-pointer" onClick={stat.onClick}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-zinc-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-zinc-100 mt-1"><AnimatedCounter to={stat.value} /></p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {metrics.data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'CPU', value: m.cpu?.percent, icon: <Cpu className="w-4 h-4" />, color: (m.cpu?.percent ?? 0) > 80 ? 'text-red-400' : 'text-emerald-400' },
            { label: 'Memory', value: m.memory?.percent, icon: <Activity className="w-4 h-4" />, color: (m.memory?.percent ?? 0) > 80 ? 'text-red-400' : 'text-emerald-400' },
            { label: 'Disk', value: m.disk?.percent, icon: <Database className="w-4 h-4" />, color: (m.disk?.percent ?? 0) > 80 ? 'text-red-400' : 'text-emerald-400' },
            { label: 'Requests/min', value: m.network ? Math.round((m.network.bytes_sent + m.network.bytes_recv) / 10240) : 0, icon: <TrendingUp className="w-4 h-4" />, color: 'text-blue-400', suffix: ' req' },
          ].map((stat) => (
            <Card key={stat.label} padding="sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-500">{stat.label}</span>
                <span className={stat.color}>{stat.icon}</span>
              </div>
              <p className="text-lg font-semibold text-zinc-100">
                {typeof stat.value === 'number' && stat.label !== 'Requests/min'
                  ? `${Math.round(stat.value)}%`
                  : formatNumber(stat.value)}
              </p>
              <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${stat.label === 'Requests/min' ? 'w-0' : ''}`}
                  style={{
                    width: typeof stat.value === 'number' && stat.label !== 'Requests/min' ? `${Math.min(stat.value, 100)}%` : '0%',
                    background: typeof stat.value === 'number' && stat.value > 80 ? 'rgb(248, 113, 113)' : 'rgb(52, 211, 153)',
                  }}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {recentModels.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Recent Models</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentModels.map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-zinc-200 truncate">{m.name}</p>
                        <p className="text-xs text-zinc-500">{m.algorithm} · v{m.version}</p>
                      </div>
                      <StatusBadge status={m.status} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {recentDeployments.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Active Deployments</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentDeployments.map((d: any) => (
                    <div key={d.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-zinc-200 truncate">{d.endpoint_name}</p>
                        <p className="text-xs text-zinc-500">{d.model_name} · {formatNumber(d.requests_total)} requests</p>
                      </div>
                      <StatusBadge status={d.status} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {recentModels.length === 0 && recentDeployments.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Brain className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-zinc-300 mb-2">Get started with AutoML</h3>
                <p className="text-sm text-zinc-500 mb-6">Upload a dataset and start training your first model</p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => setActivePage('Datasets')} icon={<Database className="w-4 h-4" />}>Upload Dataset</Button>
                  <Button variant="secondary" onClick={() => setActivePage('Training')} icon={<Brain className="w-4 h-4" />}>Start Training</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
            <CardContent>
              <ActivityTimeline />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Performance</CardTitle></CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                    <YAxis hide domain={[0, 100]} />
                    <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2} dot={{ r: 3, fill: '#6366F1', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#818cf8' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
