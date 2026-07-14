import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useExperiments() {
  return useQuery({
    queryKey: ['experiments'],
    queryFn: () => api.experiments.list(),
    select: (data) => data.experiments,
  });
}

export function useModels() {
  return useQuery({
    queryKey: ['models'],
    queryFn: () => api.models.list(),
    select: (data) => data.models,
  });
}

export function useDeployments() {
  return useQuery({
    queryKey: ['deployments'],
    queryFn: () => api.deployments.list(),
    select: (data) => data.deployments,
  });
}

export function useCreateDeployment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ model_name, endpoint_name }: { model_name: string; endpoint_name: string }) =>
      api.deployments.create(model_name, endpoint_name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deployments'] }),
  });
}

export function useDeleteDeployment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dep_id: string) => api.deployments.remove(dep_id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deployments'] }),
  });
}

export function useDatasets() {
  return useQuery({
    queryKey: ['datasets'],
    queryFn: () => api.datasets.list(),
    select: (data) => data.datasets,
  });
}

export function useDatasetPreview(name: string, rows = 50, offset = 0) {
  return useQuery({
    queryKey: ['dataset', name, 'preview', rows, offset],
    queryFn: () => api.datasets.preview(name, rows, offset),
    enabled: !!name,
  });
}

export function useDatasetProfile(name: string) {
  return useQuery({
    queryKey: ['dataset', name, 'profile'],
    queryFn: () => api.datasets.profile(name),
    enabled: !!name,
  });
}

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => api.projects.list(),
    select: (data) => data.projects,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => api.projects.get(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string }) =>
      api.projects.create(name, description),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; description?: string; status?: string }) =>
      api.projects.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.projects.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useGlobalSearch(q: string) {
  return useQuery({
    queryKey: ['search', q],
    queryFn: () => api.search(q),
    enabled: q.length >= 2,
  });
}

export function usePipelines() {
  return useQuery({
    queryKey: ['pipelines'],
    queryFn: () => api.pipelines.list(),
    select: (data) => data.pipelines,
  });
}

export function usePipeline(id: string) {
  return useQuery({
    queryKey: ['pipeline', id],
    queryFn: () => api.pipelines.get(id),
    enabled: !!id,
  });
}

export function useCreatePipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, steps, description }: { name: string; steps: any[]; description?: string }) =>
      api.pipelines.create(name, steps, description),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pipelines'] }),
  });
}

export function useDeletePipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.pipelines.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pipelines'] }),
  });
}

export function useRunPipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pipeline_id: string) => api.pipelines.run(pipeline_id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pipeline-runs'] }),
  });
}

export function usePipelineRuns(pipeline_id: string) {
  return useQuery({
    queryKey: ['pipeline-runs', pipeline_id],
    queryFn: () => api.pipelines.runs(pipeline_id),
    select: (data) => data.runs,
    enabled: !!pipeline_id,
  });
}

export function useWebhooks() {
  return useQuery({
    queryKey: ['webhooks'],
    queryFn: () => api.webhooks.list(),
    select: (data) => data.webhooks,
  });
}

export function useCreateWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; url: string; events: string[] }) => api.webhooks.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['webhooks'] }),
  });
}

export function useDeleteWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.webhooks.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['webhooks'] }),
  });
}

export function useApiKeys() {
  return useQuery({
    queryKey: ['api-keys'],
    queryFn: () => api.apiKeys.list(),
    select: (data) => data.api_keys,
  });
}

export function useCreateApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.apiKeys.create(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['api-keys'] }),
  });
}

export function useDeleteApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.apiKeys.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['api-keys'] }),
  });
}

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: () => api.teams.list(),
    select: (data) => data.teams,
  });
}

export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.teams.create(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  });
}

export function useMarketplaceItems(category?: string) {
  return useQuery({
    queryKey: ['marketplace', category],
    queryFn: () => api.marketplace.list(category),
    select: (data) => data.items,
  });
}

export function useInstallMarketplaceItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (item_id: string) => api.marketplace.install(item_id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['marketplace'] }),
  });
}

export function useActivity() {
  return useQuery({
    queryKey: ['activity'],
    queryFn: () => api.activity.list(),
    select: (data) => data.activities,
  });
}

export function useMonitoringMetrics() {
  return useQuery({
    queryKey: ['monitoring', 'metrics'],
    queryFn: () => api.monitoring.metrics(),
  });
}

export function useMonitoringStats() {
  return useQuery({
    queryKey: ['monitoring', 'stats'],
    queryFn: () => api.monitoring.stats(),
  });
}

export function useAISuggestions() {
  return useQuery({
    queryKey: ['ai', 'suggestions'],
    queryFn: () => api.ai.suggestions(),
    select: (data) => data.suggestions,
  });
}
