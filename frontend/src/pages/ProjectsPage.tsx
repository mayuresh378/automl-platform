import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, Star, Database, FlaskConical, Rocket, Loader2, Plus, X, Trash2, ExternalLink } from 'lucide-react';
import { useProjects, useExperiments, useModels, useCreateProject, useUpdateProject, useDeleteProject } from '../hooks/useApi';
import { useUIStore } from '../store/useUIStore';
import { Button } from '../components/Button';
import { AnimatedInput } from '../components/AnimatedInput';
import { staggerContainer, staggerItem } from '../lib/animations';

function ProjectsPage() {
  const { data: experiments = [], isLoading: loadingExps } = useExperiments();
  const { data: models = [], isLoading: loadingModels } = useModels();
  const { data: projects = [], isLoading: loadingProjects } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const setActivePage = useUIStore((s) => s.setActivePage);

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const loading = loadingExps || loadingModels || loadingProjects;
  const successful = experiments.filter((e: any) => e.status === 'success').length;

  const statCards = [
    { label: 'Experiments', value: experiments.length, icon: FlaskConical },
    { label: 'Successful runs', value: successful, icon: FolderOpen },
    { label: 'Trained models', value: models.length, icon: Database },
    { label: 'Deployments', value: models.filter((m: any) => m.status === 'production' || m.status === 'active').length, icon: Rocket },
  ];

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createProject.mutateAsync({ name: newName.trim(), description: newDesc.trim() || undefined });
      setNewName('');
      setNewDesc('');
      setShowCreate(false);
    } catch { /* toast handled by provider */ }
  };

  const handleRename = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await updateProject.mutateAsync({ id, name: editName.trim() });
      setEditingId(null);
      setEditName('');
    } catch { /* toast */ }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    try {
      await deleteProject.mutateAsync(id);
    } catch { /* toast */ }
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 p-6">
      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
      ) : (
        <>
          <motion.div variants={staggerItem} className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="card-hover rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">{stat.label}</span>
                    <Icon className="h-4 w-4 text-accent" />
                  </div>
                  <p className="text-2xl font-semibold text-white">{stat.value}</p>
                </div>
              );
            })}
          </motion.div>

          <motion.section variants={staggerItem} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Workspace organization</p>
                <h2 className="text-2xl font-semibold text-white">Active projects</h2>
              </div>
              <Button onClick={() => setShowCreate(true)} icon={<Plus className="h-4 w-4" />}>
                New project
              </Button>
            </div>

            <AnimatePresence>
              {showCreate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="rounded-[28px] border border-accent/30 bg-accent/5 p-5 space-y-3">
                    <AnimatedInput
                      label="Project name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="My project"
                    />
                    <AnimatedInput
                      label="Description (optional)"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="What is this project about?"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleCreate} loading={createProject.isPending}>Create project</Button>
                      <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {projects.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">No projects yet. Upload a dataset to start.</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project: any) => (
                  <motion.div
                    key={project.id}
                    layout
                    className="rounded-[28px] border border-white/10 bg-white/5 p-5 transition hover:bg-white/10 hover:border-accent/30 group"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {editingId === project.id ? (
                          <div className="flex gap-2 items-center">
                            <input
                              autoFocus
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleRename(project.id); if (e.key === 'Escape') { setEditingId(null); setEditName(''); } }}
                              className="flex-1 bg-white/10 rounded px-2 py-1 text-sm text-white outline-none border border-accent/30"
                            />
                            <button onClick={() => handleRename(project.id)} className="text-xs text-accent">Save</button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <p
                              className="font-medium text-white truncate cursor-pointer hover:text-accent transition-colors"
                              onClick={() => { setEditingId(project.id); setEditName(project.name); }}
                              title="Click to rename"
                            >
                              {project.name}
                            </p>
                          </div>
                        )}
                        <p className="text-sm text-slate-400">{project.model_ids?.length || 0} models · {project.dataset_ids?.length || 0} datasets</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="btn-press rounded-xl border border-white/10 bg-white/5 p-2 text-slate-500 transition hover:text-red-400 hover:border-red-400/30 opacity-0 group-hover:opacity-100"
                          title="Delete project"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => { setActivePage('Datasets'); }}
                          className="btn-press rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:text-white"
                          title="View project"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">{project.status || 'Development'}</div>
                      <span className="text-sm text-slate-500">{project.created_at ? new Date(project.created_at).toLocaleDateString() : ''}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>

          <motion.section variants={staggerItem} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Quick actions</p>
                <h3 className="text-lg font-semibold text-white">Get started</h3>
              </div>
              <FolderOpen className="h-5 w-5 text-accent" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <button onClick={() => setActivePage('Datasets')} className="btn-press rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">Upload a dataset</button>
              <button onClick={() => setActivePage('Training')} className="btn-press rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">Start a new training run</button>
              <button onClick={() => setActivePage('Experiments')} className="btn-press rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">View recent experiments</button>
              <button onClick={() => setActivePage('Dashboard')} className="btn-press rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">Go to dashboard</button>
            </div>
          </motion.section>
        </>
      )}
    </motion.div>
  );
}

export default ProjectsPage;