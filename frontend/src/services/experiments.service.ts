import { http } from './http';
import type { Experiment } from '../types/api';

export const experimentsService = {
  list: () => http.get<{ experiments: Experiment[] }>('/experiments'),

  get: (id: string) => http.get<Experiment>(`/experiments/${id}`),

  delete: (id: string) => http.delete(`/experiments/${id}`),

  compare: (ids: string[]) => {
    const form = new FormData();
    form.append('ids', JSON.stringify(ids));
    return http.post<{ experiments: Experiment[] }>('/experiments/compare', form);
  },
};
