import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Settings, Key, Bell, Globe, Users, Link, Plus, Trash2, Webhook } from 'lucide-react';
import { PageContainer, PageHeader } from '../../../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Tabs } from '../../../components/ui/Tabs';
import { Badge } from '../../../components/ui/Badge';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { ErrorState } from '../../../components/ui/ErrorState';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { Dialog } from '../../../components/ui/Dialog';
import { useUIStore } from '../../../store/useUIStore';
import { useNotification } from '../../../hooks/useNotification';
import { apiKeysService } from '../../../services/apiKeys.service';
import { webhooksService } from '../../../services/webhooks.service';
import { teamsService } from '../../../services/teams.service';
import { timeAgo } from '../../../lib/formatters';
import { getErrorMessage } from '../../../services/http';

const tabs = [
  { id: 'preferences', label: 'Preferences', icon: <Settings className="w-4 h-4" /> },
  { id: 'api-keys', label: 'API Keys', icon: <Key className="w-4 h-4" /> },
  { id: 'webhooks', label: 'Webhooks', icon: <Webhook className="w-4 h-4" /> },
  { id: 'teams', label: 'Teams', icon: <Users className="w-4 h-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
];

export default function SettingsPage() {
  const qc = useQueryClient();
  const { notifySuccess, notifyError } = useNotification();
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const [activeTab, setActiveTab] = useState('preferences');

  const [apiKeyName, setApiKeyName] = useState('');
  const [apiKeyModal, setApiKeyModal] = useState(false);
  const [deleteApiKeyTarget, setDeleteApiKeyTarget] = useState<string | null>(null);

  const [webhookName, setWebhookName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvents, setWebhookEvents] = useState('');
  const [webhookModal, setWebhookModal] = useState(false);
  const [deleteWebhookTarget, setDeleteWebhookTarget] = useState<string | null>(null);

  const [teamName, setTeamName] = useState('');
  const [teamModal, setTeamModal] = useState(false);

  const { data: apiKeys, isLoading: akLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => apiKeysService.list(),
    select: (d) => d.api_keys,
    enabled: activeTab === 'api-keys',
  });

  const { data: webhooks, isLoading: whLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: () => webhooksService.list(),
    select: (d) => d.webhooks,
    enabled: activeTab === 'webhooks',
  });

  const { data: teams, isLoading: tmLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsService.list(),
    select: (d) => d.teams,
    enabled: activeTab === 'teams',
  });

  const createApiKey = useMutation({
    mutationFn: () => apiKeysService.create(apiKeyName),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['api-keys'] }); notifySuccess('API key created'); setApiKeyModal(false); setApiKeyName(''); },
    onError: (err) => notifyError('Failed to create API key', getErrorMessage(err)),
  });

  const deleteApiKey = useMutation({
    mutationFn: (id: string) => apiKeysService.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['api-keys'] }); notifySuccess('API key deleted'); setDeleteApiKeyTarget(null); },
    onError: (err) => notifyError('Failed to delete API key', getErrorMessage(err)),
  });

  const createWebhook = useMutation({
    mutationFn: () => webhooksService.create({ name: webhookName, url: webhookUrl, events: webhookEvents.split(',').map((e) => e.trim()) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['webhooks'] }); notifySuccess('Webhook created'); setWebhookModal(false); setWebhookName(''); setWebhookUrl(''); setWebhookEvents(''); },
    onError: (err) => notifyError('Failed to create webhook', getErrorMessage(err)),
  });

  const deleteWebhook = useMutation({
    mutationFn: (id: string) => webhooksService.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['webhooks'] }); notifySuccess('Webhook deleted'); setDeleteWebhookTarget(null); },
    onError: (err) => notifyError('Failed to delete webhook', getErrorMessage(err)),
  });

  const createTeam = useMutation({
    mutationFn: () => teamsService.create(teamName),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teams'] }); notifySuccess('Team created'); setTeamModal(false); setTeamName(''); },
    onError: (err) => notifyError('Failed to create team', getErrorMessage(err)),
  });

  return (
    <PageContainer maxWidth="lg">
      <PageHeader title="Settings" description="Manage your account and integrations" />

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />

      {activeTab === 'preferences' && (
        <Card>
          <CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <div>
                <p className="text-sm font-medium text-zinc-200">Theme</p>
                <p className="text-xs text-zinc-500">Switch between dark and light mode</p>
              </div>
              <Button variant="secondary" size="sm" onClick={toggleTheme} icon={<Globe className="w-4 h-4" />}>
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <div>
                <p className="text-sm font-medium text-zinc-200">Email Notifications</p>
                <p className="text-xs text-zinc-500">Receive updates about training and deployments</p>
              </div>
              <div className="w-10 h-6 rounded-full bg-primary cursor-pointer relative">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'api-keys' && (
        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <Button size="sm" onClick={() => setApiKeyModal(true)} icon={<Plus className="w-4 h-4" />}>Create Key</Button>
          </CardHeader>
          <CardContent>
            {akLoading ? <LoadingSpinner /> : !apiKeys || apiKeys.length === 0 ? (
              <EmptyState title="No API keys" description="Create an API key to access the AutoML API programmatically" />
            ) : (
              <div className="space-y-2">
                {(apiKeys as any[]).map((key: any) => (
                  <div key={key.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{key.name}</p>
                      <p className="text-xs text-zinc-500 font-mono">{key.key_prefix}... · {timeAgo(key.created_at)}</p>
                    </div>
                    <button onClick={() => setDeleteApiKeyTarget(key.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'webhooks' && (
        <Card>
          <CardHeader>
            <CardTitle>Webhooks</CardTitle>
            <Button size="sm" onClick={() => setWebhookModal(true)} icon={<Plus className="w-4 h-4" />}>Add Webhook</Button>
          </CardHeader>
          <CardContent>
            {whLoading ? <LoadingSpinner /> : !webhooks || webhooks.length === 0 ? (
              <EmptyState title="No webhooks" description="Configure webhooks to receive real-time events from the platform" />
            ) : (
              <div className="space-y-2">
                {(webhooks as any[]).map((wh: any) => (
                  <div key={wh.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-zinc-200">{wh.name}</p>
                        <StatusBadge status={wh.is_active ? 'active' : 'stopped'} />
                      </div>
                      <p className="text-xs text-zinc-500 font-mono truncate">{wh.url}</p>
                      <div className="flex gap-1 mt-1">
                        {(wh.events || []).map((ev: string) => <Badge key={ev} size="sm">{ev}</Badge>)}
                      </div>
                    </div>
                    <button onClick={() => setDeleteWebhookTarget(wh.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'teams' && (
        <Card>
          <CardHeader>
            <CardTitle>Teams</CardTitle>
            <Button size="sm" onClick={() => setTeamModal(true)} icon={<Plus className="w-4 h-4" />}>Create Team</Button>
          </CardHeader>
          <CardContent>
            {tmLoading ? <LoadingSpinner /> : !teams || teams.length === 0 ? (
              <EmptyState title="No teams" description="Create a team to collaborate with others" />
            ) : (
              <div className="space-y-2">
                {(teams as any[]).map((team: any) => (
                  <div key={team.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center"><Users className="w-4 h-4 text-indigo-400" /></div>
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{team.name}</p>
                        <p className="text-xs text-zinc-500">{team.member_count} members · {team.role}</p>
                      </div>
                    </div>
                    <Badge>{team.role}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card>
          <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Training Complete', desc: 'When a training job finishes' },
              { label: 'Deployment Status', desc: 'When a deployment changes state' },
              { label: 'Experiment Results', desc: 'When an experiment completes' },
              { label: 'System Alerts', desc: 'When system resources are critical' },
              { label: 'Pipeline Runs', desc: 'When a pipeline run completes' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div>
                  <p className="text-sm text-zinc-200">{item.label}</p>
                  <p className="text-xs text-zinc-500">{item.desc}</p>
                </div>
                <div className="w-10 h-6 rounded-full bg-primary cursor-pointer relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Modal open={apiKeyModal} onClose={() => setApiKeyModal(false)} title="Create API Key" description="Create a new API key for programmatic access">
        <Input label="Key Name" value={apiKeyName} onChange={(e) => setApiKeyName(e.target.value)} placeholder="e.g., Development" />
        <div className="flex gap-3 justify-end mt-4">
          <Button variant="ghost" onClick={() => setApiKeyModal(false)}>Cancel</Button>
          <Button onClick={() => createApiKey.mutate()} loading={createApiKey.isPending} disabled={!apiKeyName}>Create</Button>
        </div>
      </Modal>

      <Modal open={webhookModal} onClose={() => setWebhookModal(false)} title="Add Webhook">
        <div className="space-y-4">
          <Input label="Name" value={webhookName} onChange={(e) => setWebhookName(e.target.value)} placeholder="My webhook" />
          <Input label="URL" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://example.com/webhook" />
          <Input label="Events (comma separated)" value={webhookEvents} onChange={(e) => setWebhookEvents(e.target.value)} placeholder="training.completed, model.deployed" helperText="e.g., training.completed, model.deployed" />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setWebhookModal(false)}>Cancel</Button>
            <Button onClick={() => createWebhook.mutate()} loading={createWebhook.isPending} disabled={!webhookName || !webhookUrl}>Create</Button>
          </div>
        </div>
      </Modal>

      <Modal open={teamModal} onClose={() => setTeamModal(false)} title="Create Team">
        <Input label="Team Name" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="My team" />
        <div className="flex gap-3 justify-end mt-4">
          <Button variant="ghost" onClick={() => setTeamModal(false)}>Cancel</Button>
          <Button onClick={() => createTeam.mutate()} loading={createTeam.isPending} disabled={!teamName}>Create</Button>
        </div>
      </Modal>

      <Dialog open={!!deleteApiKeyTarget} onClose={() => setDeleteApiKeyTarget(null)} onConfirm={() => deleteApiKeyTarget && deleteApiKey.mutate(deleteApiKeyTarget)} title="Delete API Key" message="This will immediately revoke this API key. Any services using it will lose access." confirmLabel="Revoke" loading={deleteApiKey.isPending} />

      <Dialog open={!!deleteWebhookTarget} onClose={() => setDeleteWebhookTarget(null)} onConfirm={() => deleteWebhookTarget && deleteWebhook.mutate(deleteWebhookTarget)} title="Delete Webhook" message="Are you sure you want to delete this webhook?" confirmLabel="Delete" loading={deleteWebhook.isPending} />
    </PageContainer>
  );
}
