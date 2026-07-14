import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FolderKanban, Edit3, Trash2, ArrowLeft } from 'lucide-react';
import { projectsService } from '../../../services/projects.service';
import { useUIStore } from '../../../store/useUIStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { PageContainer, PageHeader } from '../../../components/layout/PageContainer';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { ErrorState } from '../../../components/ui/ErrorState';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { timeAgo } from '../../../lib/formatters';
import { getErrorMessage } from '../../../services/http';

export default function ProjectDetailPage() {
  const projectId = useUIStore((s) => s.currentProjectId);
  const setActivePage = useUIStore((s) => s.setActivePage);

  const { data: project, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsService.get(projectId!),
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <PageContainer>
        <div className="h-8 w-48 rounded bg-white/5 animate-pulse mb-4" />
        <div className="h-64 rounded-2xl bg-white/5 animate-pulse" />
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer>
        <Button variant="ghost" onClick={() => setActivePage('Projects')} className="mb-4" icon={<ArrowLeft className="w-4 h-4" />}>Back to Projects</Button>
        <ErrorState title="Failed to load project" message={getErrorMessage(error)} onRetry={refetch} />
      </PageContainer>
    );
  }

  if (!project) {
    return (
      <PageContainer>
        <Button variant="ghost" onClick={() => setActivePage('Projects')} className="mb-4" icon={<ArrowLeft className="w-4 h-4" />}>Back to Projects</Button>
        <ErrorState title="Project not found" onRetry={() => setActivePage('Projects')} />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="lg">
      <Button variant="ghost" onClick={() => setActivePage('Projects')} className="mb-4" icon={<ArrowLeft className="w-4 h-4" />}>Back to Projects</Button>

      <PageHeader title={project.name} description={project.description || 'No description'}>
        <StatusBadge status={project.status} />
        <Button variant="secondary" size="sm" icon={<Edit3 className="w-4 h-4" />}>Edit</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-zinc-500">Status</span><StatusBadge status={project.status} /></div>
            <div className="flex justify-between"><span className="text-zinc-500">Created</span><span className="text-zinc-300">{timeAgo(project.created_at)}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Updated</span><span className="text-zinc-300">{timeAgo(project.updated_at)}</span></div>
            {project.tags && project.tags.length > 0 && (
              <div className="flex justify-between">
                <span className="text-zinc-500">Tags</span>
                <div className="flex gap-1">{project.tags.map((t: string) => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-zinc-300">{t}</span>)}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            {project.notes ? (
              <p className="text-sm text-zinc-300 whitespace-pre-wrap">{project.notes}</p>
            ) : (
              <p className="text-sm text-zinc-500 italic">No notes added yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
