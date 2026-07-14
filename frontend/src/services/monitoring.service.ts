import { http } from './http';
import type { MonitoringMetrics, MonitoringStats } from '../types/api';

export const monitoringService = {
  metrics: () => http.get<MonitoringMetrics>('/monitoring/metrics'),

  stats: () => http.get<MonitoringStats>('/monitoring/stats'),

  health: () => http.get<{ status: string }>('/health'),
};
