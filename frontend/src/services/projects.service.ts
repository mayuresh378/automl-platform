import { http } from './http';
import type { Project } from '../types/api';

export const projectsService = {
  list: () => http.get<{ projects: Project[] }>('/projects'),

  mine: () => http.get<{ projects: Project[] }>('/projects/mine'),

  get: (id: string) => http.get<Project>(`/projects/${id}`),

  create: (name: string, description?: string) => {
    const form = new FormData();
    form.append('name', name);
    if (description) form.append('description', description);
    return http.post<Project>('/projects', form);
  },

  update: (id: string, data: { name?: string; description?: string; status?: string }) =>
    http.put<Project>(`/projects/${id}`, data),

  remove: (id: string) => http.delete(`/projects/${id}`),

  updateNotes: (id: string, notes: string) => {
    const form = new FormData();
    form.append('notes', notes);
    return http.put<Project>(`/projects/${id}/notes`, form);
  },

  templates: () => http.get<{ templates: Project[] }>('/projects/templates'),
};
