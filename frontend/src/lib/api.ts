const BASE = '/api/v1';

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
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
};
