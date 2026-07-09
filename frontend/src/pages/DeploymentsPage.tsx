import { useState, useEffect } from 'react';
import { Cloud, CheckCircle2, Rocket, Trash2, Plus } from 'lucide-react';
import { api } from '../lib/api';

function DeploymentsPage() {
  const [deployments, setDeployments] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');
  const [endpointName, setEndpointName] = useState('');

  const load = () => {
    api.deployments.list().then(r => setDeployments(r.deployments)).catch(() => {});
    api.models.list().then(r => setModels(r.models)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleDeploy = async () => {
    if (!selectedModel || !endpointName) return;
    try {
      await api.deployments.create(selectedModel, endpointName);
      setShowForm(false);
      setSelectedModel('');
      setEndpointName('');
      load();
    } catch (err: any) { alert(err.message); }
  };

  const handleUndeploy = async (id: string) => {
    if (!confirm('Undeploy this endpoint?')) return;
    try {
      await api.deployments.remove(id);
      load();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Model serving</p>
            <h2 className="text-2xl font-semibold text-white">Deployed endpoints</h2>
          </div>
          <button className="flex items-center gap-2 rounded-2xl bg-primary/20 px-4 py-2 text-sm font-medium text-white hover:bg-primary/30" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4" /> Deploy model
          </button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-3xl border border-primary/20 bg-primary/5 p-5 space-y-4 transition-all duration-300">
            <p className="text-sm font-medium text-white">New deployment</p>
            <select className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none" value={selectedModel} onChange={e => setSelectedModel(e.target.value)}>
              <option value="">Select a model...</option>
              {models.map((m: any) => <option key={m.name} value={m.name}>{m.name} ({m.task_type || '—'})</option>)}
            </select>
            <input className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none" placeholder="Endpoint name (e.g. my-api)" value={endpointName} onChange={e => setEndpointName(e.target.value)} />
            <div className="flex gap-3">
              <button className="rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50" onClick={handleDeploy} disabled={!selectedModel || !endpointName}>Deploy</button>
              <button className="rounded-2xl bg-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/20" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        {deployments.length === 0 && !showForm && (
          <div className="py-16 text-center text-sm text-slate-500">No deployments yet. Deploy a model to create an endpoint.</div>
        )}

        <div className="space-y-3">
          {deployments.map((dep: any) => (
            <div key={dep.id} className="rounded-[28px] border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="font-medium text-white">{dep.endpoint_name}</p>
                  <p className="text-sm text-slate-400">{dep.model_name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    {dep.status}
                  </div>
                  <button className="rounded-xl bg-red-500/10 px-3 py-1 text-xs text-red-400 hover:bg-red-500/20" onClick={() => handleUndeploy(dep.id)}>
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span className="font-mono text-xs">{dep.endpoint_url || '—'}</span>
                <span>{dep.requests_count || 0} requests</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Monitoring</p>
              <h3 className="text-lg font-semibold text-white">Deployment health</h3>
            </div>
            <Cloud className="h-5 w-5 text-primary" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: 'Active endpoints', value: deployments.filter((d: any) => d.status === 'Active').length },
              { label: 'Total requests', value: deployments.reduce((s: number, d: any) => s + (d.requests_count || 0), 0) },
              { label: 'Models available', value: models.length },
              { label: 'Deployed models', value: deployments.length },
            ].map((metric) => (
              <div key={metric.label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">{metric.label}</p>
                <p className="mt-1 text-2xl font-semibold text-white">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">How it works</p>
              <h3 className="text-lg font-semibold text-white">Deployment guide</h3>
            </div>
            <Rocket className="h-5 w-5 text-accent" />
          </div>
          <div className="space-y-3 text-sm text-slate-400">
            <p>1. Train a model in the Training section</p>
            <p>2. Click "Deploy model" and select your model</p>
            <p>3. Give it an endpoint name</p>
            <p>4. Use the endpoint URL to make predictions</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DeploymentsPage;
