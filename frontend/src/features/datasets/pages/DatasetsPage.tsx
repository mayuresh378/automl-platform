import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Upload, Database, FileText, Trash2, Download, AlertCircle, Search } from 'lucide-react';
import { datasetsService } from '../../../services/datasets.service';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { PageContainer, PageHeader } from '../../../components/layout/PageContainer';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { Dialog } from '../../../components/ui/Dialog';
import { Modal } from '../../../components/ui/Modal';
import { useNotification } from '../../../hooks/useNotification';
import { useUIStore } from '../../../store/useUIStore';
import { formatBytes, timeAgo } from '../../../lib/formatters';
import { staggerContainer, staggerItem } from '../../../lib/animations';
import { getErrorMessage } from '../../../services/http';

export default function DatasetsPage() {
  const qc = useQueryClient();
  const setActivePage = useUIStore((s) => s.setActivePage);
  const { notifySuccess, notifyError } = useNotification();
  const [search, setSearch] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: datasets, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['datasets'],
    queryFn: () => datasetsService.list(),
    select: (d) => d.datasets,
  });

  const deleteMutation = useMutation({
    mutationFn: (name: string) => datasetsService.remove(name),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['datasets'] }); notifySuccess('Dataset deleted'); setDeleteTarget(null); },
    onError: (err) => notifyError('Failed to delete', getErrorMessage(err)),
  });

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      await datasetsService.upload(selectedFile);
      qc.invalidateQueries({ queryKey: ['datasets'] });
      notifySuccess('Dataset uploaded', selectedFile.name);
      setUploadOpen(false);
      setSelectedFile(null);
    } catch (err) {
      notifyError('Upload failed', getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Datasets" description="Upload and manage your datasets" />
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      </PageContainer>
    );
  }

  if (isError) {
    return <PageContainer><ErrorState title="Failed to load datasets" message={getErrorMessage(error)} onRetry={refetch} /></PageContainer>;
  }

  const filtered = (datasets || []).filter((d: any) =>
    d.name.toLowerCase().includes(search.toLowerCase()) || d.filename?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageContainer>
      <PageHeader title="Datasets" description="Upload and manage your datasets">
        <Button onClick={() => setUploadOpen(true)} icon={<Upload className="w-4 h-4" />}>Upload Dataset</Button>
      </PageHeader>

      <div className="mb-6">
        <Input
          placeholder="Search datasets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
      </div>

      {filtered.length === 0 ? (
        datasets && datasets.length > 0 ? (
          <EmptyState title="No datasets match your search" description="Try a different search term" />
        ) : (
          <EmptyState
            icon={<Database className="w-8 h-8 text-zinc-500" />}
            title="No datasets yet"
            description="Upload a CSV or Excel file to get started with AutoML"
            action={{ label: 'Upload Dataset', onClick: () => setUploadOpen(true) }}
          />
        )
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
          {filtered.map((dataset: any) => (
            <motion.div key={dataset.id || dataset.name} variants={staggerItem}>
              <Card hover padding="md" className="cursor-pointer" onClick={() => setActivePage('Explorer')}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-200 truncate">{dataset.filename || dataset.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-zinc-500">{dataset.rows?.toLocaleString()} rows</span>
                        <span className="text-xs text-zinc-500">{dataset.columns} columns</span>
                        {dataset.size_bytes && <span className="text-xs text-zinc-500">{formatBytes(dataset.size_bytes)}</span>}
                        <span className="text-xs text-zinc-500">{timeAgo(dataset.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatusBadge status={dataset.status} />
                    <button
                      onClick={(e) => { e.stopPropagation(); setActivePage('Dataset Analysis'); }}
                      className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-zinc-300 transition-colors"
                      title="Analyze"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(dataset.name); }}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Modal open={uploadOpen} onClose={() => { setUploadOpen(false); setSelectedFile(null); }} title="Upload Dataset" description="Supports CSV and Excel files">
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer ${selectedFile ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-white/20'}`}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Upload className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
            <p className="text-sm text-zinc-300 mb-1">{selectedFile ? selectedFile.name : 'Click to select a file'}</p>
            <p className="text-xs text-zinc-500">CSV or Excel files up to 100MB</p>
            <input id="file-upload" type="file" accept=".csv,.xls,.xlsx" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => { setUploadOpen(false); setSelectedFile(null); }}>Cancel</Button>
            <Button onClick={handleUpload} loading={uploading} disabled={!selectedFile}>Upload</Button>
          </div>
        </div>
      </Modal>

      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        title="Delete Dataset"
        message={`Are you sure you want to delete "${deleteTarget}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
      />
    </PageContainer>
  );
}
