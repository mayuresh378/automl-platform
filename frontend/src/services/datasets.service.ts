import { http } from './http';
import type { Dataset, DatasetPreview, DatasetProfile, DatasetAnalysisResult } from '../types/api';

export const datasetsService = {
  list: () => http.get<{ datasets: Dataset[] }>('/datasets'),

  get: (name: string) => http.get<Dataset>(`/datasets/${encodeURIComponent(name)}`),

  upload: (file: File) => http.upload<Dataset>('/datasets', file),

  preview: (name: string, rows = 50, offset = 0) =>
    http.get<DatasetPreview>(`/datasets/${encodeURIComponent(name)}/preview`, { rows, offset }),

  profile: (name: string) =>
    http.get<DatasetProfile>(`/datasets/${encodeURIComponent(name)}/profile`),

  remove: (name: string) =>
    http.delete(`/datasets/${encodeURIComponent(name)}`),

  clean: (name: string, operations: any[]) => {
    const form = new FormData();
    form.append('operations', JSON.stringify(operations));
    return http.post<Dataset>(`/datasets/${encodeURIComponent(name)}/clean`, form);
  },

  autoClean: (name: string) =>
    http.post<Dataset>(`/datasets/${encodeURIComponent(name)}/auto-clean`),

  analyze: (name: string, target?: string) =>
    http.get<DatasetAnalysisResult>(`/datasets/${encodeURIComponent(name)}/analyze`, target ? { target } : undefined),

  suggestFeatures: (name: string) =>
    http.get<{ suggestions: any[] }>(`/datasets/${encodeURIComponent(name)}/features/suggest`),

  generateFeatures: (name: string, operations: any[]) => {
    const form = new FormData();
    form.append('operations', JSON.stringify(operations));
    return http.post<Dataset>(`/datasets/${encodeURIComponent(name)}/features/generate`, form);
  },

  updateTags: (name: string, tags: string[]) => {
    const form = new FormData();
    form.append('tags', JSON.stringify(tags));
    return http.put(`/datasets/${encodeURIComponent(name)}/tags`, form);
  },

  updateDescription: (name: string, description: string) => {
    const form = new FormData();
    form.append('description', description);
    return http.put(`/datasets/${encodeURIComponent(name)}/description`, form);
  },

  importFromUrl: (url: string, name?: string) => {
    const form = new FormData();
    form.append('url', url);
    if (name) form.append('name', name);
    return http.post<{ filename: string; rows: number; id: string }>('/datasets/import-url', form);
  },

  importFromDatabase: (connectionString: string, query: string, name?: string) => {
    const form = new FormData();
    form.append('connection_string', connectionString);
    form.append('query', query);
    if (name) form.append('name', name);
    return http.post<{ filename: string; rows: number; id: string }>('/datasets/import-database', form);
  },

  share: (name: string, email: string, permission = 'view') => {
    const form = new FormData();
    form.append('email', email);
    form.append('permission', permission);
    return http.post(`/datasets/${encodeURIComponent(name)}/share`, form);
  },

  listShares: (name: string) =>
    http.get<{ id: string; email: string; permission: string; created_at: string }[]>(
      `/datasets/${encodeURIComponent(name)}/shares`
    ),

  removeShare: (name: string, shareId: string) =>
    http.delete(`/datasets/${encodeURIComponent(name)}/shares/${shareId}`),
};
