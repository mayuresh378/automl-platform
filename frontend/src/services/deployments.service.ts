import { http } from './http';
import type { Deployment } from '../types/api';

export const deploymentsService = {
  list: () => http.get<{ deployments: Deployment[] }>('/deployments'),

  get: (id: string) => http.get<Deployment>(`/deployments/${id}`),

  create: (model_name: string, endpoint_name: string) => {
    const form = new FormData();
    form.append('model_name', model_name);
    form.append('endpoint_name', endpoint_name);
    return http.post<Deployment>('/deployments', form);
  },

  remove: (dep_id: string) => http.delete(`/deployments/${dep_id}`),

  update: (dep_id: string, data: { min_replicas?: number; max_replicas?: number }) =>
    http.put(`/deployments/${dep_id}`, data),
};
