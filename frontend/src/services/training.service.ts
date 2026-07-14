import { http } from './http';
import type { Experiment, TrainingJob } from '../types/api';

export const trainingService = {
  start: (file_name: string, target_column: string, hyperparameters?: Record<string, any>) => {
    const form = new FormData();
    form.append('file_name', file_name);
    form.append('target_column', target_column);
    if (hyperparameters) form.append('hyperparameters', JSON.stringify(hyperparameters));
    return http.post<Experiment>('/training', form);
  },

  list: () => http.get<{ experiments: Experiment[] }>('/training'),

  get: (id: string) => http.get<Experiment>(`/training/${id}`),

  cancel: (id: string) => http.post(`/training/${id}/cancel`),

  queue: () => http.get<{ jobs: TrainingJob[] }>('/training/queue'),
};
