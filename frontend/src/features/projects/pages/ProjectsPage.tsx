import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FolderKanban, Plus, Trash2, Edit3, Search } from 'lucide-react';
import { projectsService } from '../../../services/projects.service';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { PageContainer, PageHeader } from '../../../components/layout/PageContainer';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { Modal } from '../../../components/ui/Modal';
import { Dialog } from '../../../components/ui/Dialog';
import { useNotification } from '../../../hooks/useNotification';
import { useUIStore } from '../../../store/useUIStore';
import { staggerContainer, staggerItem } from '../../../lib/animations';
import { timeAgo } from '../../../lib/formatters';
import { getErrorMessage } from '../../../services/http';

export default function ProjectsPage() {
  const qc = useQueryClient();
  const setActivePage = useUIStore((s) => s.setActivePage);
  const setCurrentProjectId = useUIStore((s) => s.setCurrentProjectId);
  const { notifySuccess, notifyError } = useNotification();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const { data: projects, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsService.list(),
    select: (d) => d.projects,
  });

  const createMutation = useMutation({
    mutationFn: () => projectsService.create(newName, newDescription || undefined),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      notifySuccess('Project created');
      setCreateOpen(false);
      setNewName('');
      setNewDescription('');
      setCurrentProjectId(data.id);
      setActivePage('Project Detail');
    },
    onError: (err) => notifyError('Failed to create project', getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsService.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); notifySuccess('Project deleted'); setDeleteTarget(null); },
    onError: (err) => notifyError('Failed to delete', getErrorMessage(err)),
  });

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Projects" description="Organize your ML workflows" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse" />)}
        </div>
      </PageContainer>
    );
  }

  if (isError) {
    return <PageContainer><ErrorState title="Failed to load projects" message={getErrorMessage(error)} onRetry={refetch} /></PageContainer>;
  }

  const filtered = (projects || []).filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageContainer>
      <PageHeader title="Projects" description="Organize your ML workflows">
        <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search className="w-4 h-4" />} className="w-56" />
        <Button onClick={() => setCreateOpen(true)} icon={<Plus className="w-4 h-4" />}>New Project</Button>
      </PageHeader>

      {filtered.length === 0 ? (
        projects && projects.length > 0 ? (
          <EmptyState title="No projects match your search" />
        ) : (
          <EmptyState icon={<FolderKanban className="w-8 h-8" />} title="No projects yet" description="Create a project to organize your datasets, models, and deployments" action={{ label: 'Create Project', onClick: () => setCreateOpen(true) }} />
        )
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project: any) => (
            <motion.div key={project.id} variants={staggerItem}>
              <Card hover padding="md" className="h-full cursor-pointer" onClick={() => { setCurrentProjectId(project.id); setActivePage('Project Detail'); }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                    <FolderKanban className="w-5 h-5 text-blue-400" />
                  </div>
                  <StatusBadge status={project.status} />
                </div>
                <h3 className="text-sm font-semibold text-zinc-100 mb-1 truncate">{project.name}</h3>
                {project.description && <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{project.description}</p>}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                  <span className="text-xs text-zinc-500">{timeAgo(project.created_at)}</span>
                  <div className="flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setCurrentProjectId(project.id); setActivePage('Project Detail'); }} className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-zinc-300"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(project.id); }} className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Project">
        <div className="space-y-4">
          <Input label="Project Name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="My ML Project" />
          <Input label="Description (optional)" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="A brief description of this project" />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} loading={createMutation.isPending} disabled={!newName}>Create</Button>
          </div>
        </div>
      </Modal>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)} title="Delete Project" message="Are you sure? This will not delete associated datasets or models." confirmLabel="Delete" loading={deleteMutation.isPending} />
    </PageContainer>
  );
}
