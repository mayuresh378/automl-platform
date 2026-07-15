import { http } from './http';
import type { Dataset, DatasetPreview, DatasetProfile, DatasetAnalysis } from '../types/api';

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
    http.get<DatasetAnalysis>(`/datasets/${encodeURIComponent(name)}/analyze`, target ? { target } : undefined),

  suggestFeatures: (name: string) =>
    http.get<{ suggestions: any[] }>(`/datasets/${encodeURIComponent(name)}/features/suggest`),

  generateFeatures: (name: string, operations: any[]) => {
    const form = new FormData();
    form.append('operations', JSON.stringify(operations));
    return http.post<Dataset>(`/datasets/${encodeURIComponent(name)}/features/generate`, form);
  },
};
