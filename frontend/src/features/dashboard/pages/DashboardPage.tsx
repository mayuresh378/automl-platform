import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Activity, Database, Box, Rocket, TrendingUp, Clock, Brain, Cpu, ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';
import { useUIStore } from '../../../store/useUIStore';
import { monitoringService } from '../../../services/monitoring.service';
import { projectsService } from '../../../services/projects.service';
import { datasetsService } from '../../../services/datasets.service';
import { modelsService } from '../../../services/models.service';
import { deploymentsService } from '../../../services/deployments.service';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { PageContainer, PageHeader } from '../../../components/layout/PageContainer';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { ErrorState } from '../../../components/ui/ErrorState';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { AnimatedCounter } from '../../../components/AnimatedCounter';
import { staggerContainer, staggerItem } from '../../../lib/animations';
import { formatNumber } from '../../../lib/formatters';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { cn } from '../../../lib/cn';

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
            <div key={i} className="h-28 rounded-lg bg-card animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 rounded-lg bg-card animate-pulse" />
          <div className="h-80 rounded-lg bg-card animate-pulse" />
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

  const statCards = [
    { label: 'Projects', value: projects.data?.length || 0, icon: Box, color: 'text-primary bg-primary/10', change: '+2.5%', trend: 'up', onClick: () => setActivePage('Projects') },
    { label: 'Datasets', value: datasets.data?.length || 0, icon: Database, color: 'text-success bg-success/10', change: '+5.2%', trend: 'up', onClick: () => setActivePage('Datasets') },
    { label: 'Models', value: models.data?.length || 0, icon: Brain, color: 'text-secondary bg-secondary/10', change: '+1.3%', trend: 'up', onClick: () => setActivePage('Models') },
    { label: 'Deployments', value: deployments.data?.length || 0, icon: Rocket, color: 'text-accent bg-accent/10', change: '-0.8%', trend: 'down', onClick: () => setActivePage('Deployment') },
  ];

  const recentModels = (models.data || []).slice(0, 5);
  const recentDeployments = (deployments.data || []).slice(0, 5);

  const chartData = Array.from({ length: 12 }, (_, i) => ({
    time: `${i * 2}h`,
    value: 40 + Math.sin(i * 0.8) * 20 + Math.cos(i * 0.3) * 10 + (i % 3 === 0 ? 5 : 0),
  }));

  return (
    <PageContainer>
      <PageHeader title={`Welcome${user?.name ? `, ${user.name}` : ''}`} description="Here's your AutoML overview">
        <Button variant="secondary" size="sm" onClick={() => setActivePage('Datasets')}>Upload Dataset</Button>
        <Button size="sm" onClick={() => setActivePage('Training')}>New Training</Button>
      </PageHeader>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} variants={staggerItem}>
              <Card hover className="cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', stat.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={cn('text-xs font-medium flex items-center gap-0.5', stat.trend === 'up' ? 'text-success' : 'text-danger')}>
                    {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-zinc-200"><AnimatedCounter to={stat.value} /></p>
                <p className="text-sm text-zinc-500 mt-0.5">{stat.label}</p>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Last 24 hours</span>
                <button className="p-1 rounded hover:bg-sidebar-hover text-zinc-500">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                    <YAxis hide domain={[0, 100]} />
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#3b82f6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {recentModels.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Models</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setActivePage('Models')}>View all</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {recentModels.map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-sidebar-hover transition-colors">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Brain className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-zinc-200 truncate">{m.name}</p>
                          <p className="text-xs text-zinc-500">{m.algorithm} · v{m.version}</p>
                        </div>
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
              <CardHeader>
                <CardTitle>Deployments</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setActivePage('Deployment')}>View all</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {recentDeployments.map((d: any) => (
                    <div key={d.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-sidebar-hover transition-colors">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                          <Rocket className="w-4 h-4 text-accent" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-zinc-200 truncate">{d.endpoint_name}</p>
                          <p className="text-xs text-zinc-500">{d.model_name} · {formatNumber(d.requests_total)} requests</p>
                        </div>
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
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-zinc-200 mb-1">Welcome to AutoML</h3>
                <p className="text-sm text-zinc-500 max-w-sm mx-auto mb-6">Upload a dataset and start training your first model</p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => setActivePage('Datasets')}>Upload Dataset</Button>
                  <Button variant="secondary" onClick={() => setActivePage('Training')}>Start Training</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {metrics.data && (
            <Card>
              <CardHeader>
                <CardTitle>System</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'CPU', value: (metrics.data as any).cpu?.percent, icon: Cpu, color: 'text-primary' },
                  { label: 'Memory', value: (metrics.data as any).memory?.percent, icon: Activity, color: 'text-success' },
                  { label: 'Disk', value: (metrics.data as any).disk?.percent, icon: Database, color: 'text-warning' },
                ].map((stat) => {
                  const val = typeof stat.value === 'number' ? Math.round(stat.value) : 0;
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Icon className={cn('w-3.5 h-3.5', stat.color)} />
                          <span className="text-xs text-zinc-400">{stat.label}</span>
                        </div>
                        <span className="text-xs font-medium text-zinc-300">{val}%</span>
                      </div>
                      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${val}%` }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: Activity, color: 'text-primary bg-primary/10', text: 'Training job completed', time: '2m ago' },
                { icon: Database, color: 'text-success bg-success/10', text: 'Dataset uploaded', time: '15m ago' },
                { icon: Rocket, color: 'text-accent bg-accent/10', text: 'Model deployed', time: '1h ago' },
                { icon: Brain, color: 'text-secondary bg-secondary/10', text: 'Model training started', time: '2h ago' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', item.color)}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-zinc-300">{item.text}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
