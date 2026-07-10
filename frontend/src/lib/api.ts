import { useAuthStore } from '../store/useAuthStore';

const BASE = '/api/v1';

export function downloadUrl(path: string) {
  const token = useAuthStore.getState().token;
  const url = `${BASE}${path}`;
  if (!token) return url;
  const sep = path.includes('?') ? '&' : '?';
  return `${url}${sep}token=${token}`;
}

export function downloadBlob(data: Record<string, any>[], filename: string) {
  const header = Object.keys(data[0] || {});
  const csv = [header.join(','), ...data.map(r => header.map(k => JSON.stringify(r[k] ?? '')).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (init?.body instanceof FormData) {
    delete headers['Content-Type'];
  }
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) => {
      const form = new FormData();
      form.append('email', email);
      form.append('password', password);
      return fetchJSON<{ token: string; user: { id: string; email: string; name: string } }>(`${BASE}/auth/login`, { method: 'POST', body: form });
    },
    register: (email: string, password: string, name: string) => {
      const form = new FormData();
      form.append('email', email);
      form.append('password', password);
      form.append('name', name);
      return fetchJSON<{ token: string; user: { id: string; email: string; name: string } }>(`${BASE}/auth/register`, { method: 'POST', body: form });
    },
    me: () => fetchJSON<{ user: { id: string; email: string; name: string } }>(`${BASE}/auth/me`),
  },

  datasets: {
    list: () => fetchJSON<{ datasets: any[] }>(`${BASE}/datasets`),
    upload: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return fetchJSON(`${BASE}/datasets`, { method: 'POST', body: form });
    },
    preview: (name: string, rows = 50, offset = 0) =>
      fetchJSON<any>(`${BASE}/datasets/${encodeURIComponent(name)}/preview?rows=${rows}&offset=${offset}`),
    profile: (name: string) =>
      fetchJSON<any>(`${BASE}/datasets/${encodeURIComponent(name)}/profile`),
    clean: (name: string, operations: any[]) => {
      const form = new FormData();
      form.append('operations', JSON.stringify(operations));
      return fetchJSON(`${BASE}/datasets/${encodeURIComponent(name)}/clean`, { method: 'POST', body: form });
    },
    suggestFeatures: (name: string) =>
      fetchJSON<any>(`${BASE}/datasets/${encodeURIComponent(name)}/features/suggest`),
    generateFeatures: (name: string, operations: any[]) => {
      const form = new FormData();
      form.append('operations', JSON.stringify(operations));
      return fetchJSON(`${BASE}/datasets/${encodeURIComponent(name)}/features/generate`, { method: 'POST', body: form });
    },
  },

  training: {
    start: (file_name: string, target_column: string) => {
      const form = new FormData();
      form.append('file_name', file_name);
      form.append('target_column', target_column);
      return fetchJSON(`${BASE}/training`, { method: 'POST', body: form });
    },
  },

  experiments: {
    list: () => fetchJSON<{ experiments: any[] }>(`${BASE}/experiments`),
  },

  models: {
    list: () => fetchJSON<{ models: any[] }>(`${BASE}/models`),
    detail: (name: string) => fetchJSON<any>(`${BASE}/models/${encodeURIComponent(name)}`),
    remove: (name: string) => fetchJSON(`${BASE}/models/${encodeURIComponent(name)}`, { method: 'DELETE' }),
  },

  deployments: {
    list: () => fetchJSON<{ deployments: any[] }>(`${BASE}/deployments`),
    create: (model_name: string, endpoint_name: string) => {
      const form = new FormData();
      form.append('model_name', model_name);
      form.append('endpoint_name', endpoint_name);
      return fetchJSON(`${BASE}/deployments`, { method: 'POST', body: form });
    },
    remove: (dep_id: string) => fetchJSON(`${BASE}/deployments/${dep_id}`, { method: 'DELETE' }),
  },

  predictions: {
    run: (model_name: string, payload: Record<string, any>) => {
      const form = new FormData();
      form.append('model_name', model_name);
      form.append('payload', JSON.stringify(payload));
      return fetchJSON(`${BASE}/predictions`, { method: 'POST', body: form });
    },
  },

  monitoring: {
    metrics: () => fetchJSON(`${BASE}/monitoring/metrics`),
    stats: () => fetchJSON(`${BASE}/monitoring/stats`),
  },

  activity: {
    list: () => fetchJSON<{ activities: any[] }>(`${BASE}/activity`),
  },

  pipelines: {
    list: () => fetchJSON<{ pipelines: any[] }>(`${BASE}/pipelines`),
    get: (id: string) => fetchJSON<any>(`${BASE}/pipelines/${id}`),
    create: (name: string, steps: any[], description?: string) => {
      return fetchJSON(`${BASE}/pipelines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, steps, description }),
      });
    },
    update: (id: string, data: { name?: string; description?: string; steps?: any[]; schedule?: string }) => {
      return fetchJSON(`${BASE}/pipelines/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },
    delete: (id: string) =>
      fetchJSON(`${BASE}/pipelines/${id}`, { method: 'DELETE' }),
    run: (pipeline_id: string) =>
      fetchJSON(`${BASE}/pipelines/${pipeline_id}/run`, { method: 'POST' }),
    runs: (pipeline_id: string) =>
      fetchJSON<{ runs: any[] }>(`${BASE}/pipelines/${pipeline_id}/runs`),
    getRun: (run_id: string) =>
      fetchJSON<any>(`${BASE}/pipeline-runs/${run_id}`),
  },

  webhooks: {
    list: () => fetchJSON<{ webhooks: any[] }>(`${BASE}/webhooks`),
    create: (data: { name: string; url: string; events: string[] }) => {
      return fetchJSON(`${BASE}/webhooks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },
    remove: (webhook_id: string) =>
      fetchJSON(`${BASE}/webhooks/${webhook_id}`, { method: 'DELETE' }),
  },

  projects: {
    list: () => fetchJSON<{ projects: any[] }>(`${BASE}/projects`),
    create: (name: string, description?: string) => {
      const form = new FormData();
      form.append('name', name);
      if (description) form.append('description', description);
      return fetchJSON(`${BASE}/projects`, { method: 'POST', body: form });
    },
  },

  marketplace: {
    list: (category?: string) =>
      fetchJSON<{ items: any[] }>(`${BASE}/marketplace${category ? `?category=${category}` : ''}`),
    install: (item_id: string) =>
      fetchJSON(`${BASE}/marketplace/${item_id}/install`, { method: 'POST' }),
  },

  apiKeys: {
    list: () => fetchJSON<{ api_keys: any[] }>(`${BASE}/api-keys`),
    create: (name: string) => {
      const form = new FormData();
      form.append('name', name);
      return fetchJSON(`${BASE}/api-keys`, { method: 'POST', body: form });
    },
    remove: (key_id: string) =>
      fetchJSON(`${BASE}/api-keys/${key_id}`, { method: 'DELETE' }),
  },

  teams: {
    list: () => fetchJSON<{ teams: any[] }>(`${BASE}/teams`),
    create: (name: string) => {
      const form = new FormData();
      form.append('name', name);
      return fetchJSON(`${BASE}/teams`, { method: 'POST', body: form });
    },
  },

  ai: {
    chat: (question: string) => {
      const form = new FormData();
      form.append('question', question);
      return fetchJSON<{ answer: string }>(`${BASE}/ai/chat`, { method: 'POST', body: form });
    },
    suggestions: () => fetchJSON<{ suggestions: string[] }>(`${BASE}/ai/suggestions`),
  },
};
