import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppShell from '../components/AppShell';

const Landing = lazy(() => import('../pages/Landing'));
const NotFound = lazy(() => import('../pages/NotFound'));

const Dashboard = lazy(() => import('../features/dashboard/pages/DashboardPage'));
const Datasets = lazy(() => import('../features/datasets/pages/DatasetsPage'));
const Training = lazy(() => import('../features/training/pages/TrainingPage'));
const Experiments = lazy(() => import('../features/experiments/pages/ExperimentsPage'));
const Models = lazy(() => import('../features/models/pages/ModelRegistryPage'));
const Deployments = lazy(() => import('../features/deployments/pages/DeploymentsPage'));
const Monitoring = lazy(() => import('../features/monitoring/pages/MonitoringPage'));
const Settings = lazy(() => import('../features/settings/pages/SettingsPage'));
const SQLEditor = lazy(() => import('../features/sql/pages/SQLEditorPage'));
const Explain = lazy(() => import('../features/explain/pages/ExplainPage'));
const AIAssistant = lazy(() => import('../features/ai/pages/AIAssistantPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/app',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'datasets', element: <Datasets /> },
      { path: 'training', element: <Training /> },
      { path: 'experiments', element: <Experiments /> },
      { path: 'models', element: <Models /> },
      { path: 'deployments', element: <Deployments /> },
      { path: 'monitoring', element: <Monitoring /> },
      { path: 'settings', element: <Settings /> },
      { path: 'sql', element: <SQLEditor /> },
      { path: 'explain', element: <Explain /> },
      { path: 'ai', element: <AIAssistant /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
