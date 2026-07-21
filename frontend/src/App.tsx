import { lazy, Suspense } from 'react';
import type { FC } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { CommandPalette } from './components/CommandPalette';
import { ToastProvider } from './components/ToastProvider';
import { LoadingSpinner } from './components/LoadingSpinner';
import { AnimatePresence, motion } from 'framer-motion';
import { useUIStore } from './store/useUIStore';

const Dashboard = lazy(() => import('./features/dashboard/pages/DashboardPage'));
const SearchPage = lazy(() => import('./features/search/pages/SearchPage'));
const ProjectsPage = lazy(() => import('./features/projects/pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('./features/projects/pages/ProjectDetailPage'));
const DatasetsPage = lazy(() => import('./features/datasets/pages/DatasetsPage'));
const CleaningPage = lazy(() => import('./features/datasets/pages/CleaningPage'));
const FeatureEngineeringPage = lazy(() => import('./features/datasets/pages/FeatureEngineeringPage'));
const ExplorerPage = lazy(() => import('./features/datasets/pages/ExplorerPage'));
const DatasetAnalysisPage = lazy(() => import('./features/datasets/pages/DatasetAnalysisPage'));
const TrainingPage = lazy(() => import('./features/training/pages/TrainingPage'));
const ExperimentsPage = lazy(() => import('./features/experiments/pages/ExperimentsPage'));
const HyperparameterPage = lazy(() => import('./features/training/pages/HyperparameterPage'));
const ModelRegistryPage = lazy(() => import('./features/models/pages/ModelRegistryPage'));
const ModelComparisonPage = lazy(() => import('./features/models/pages/ModelComparisonPage'));
const ExplainableAIPage = lazy(() => import('./features/models/pages/ExplainableAIPage'));
const DeploymentsPage = lazy(() => import('./features/deployments/pages/DeploymentsPage'));
const PredictionPage = lazy(() => import('./features/prediction/pages/PredictionPage'));
const PipelinesPage = lazy(() => import('./features/pipelines/pages/PipelinesPage'));
const AutomationsPage = lazy(() => import('./features/automations/pages/AutomationsPage'));
const MonitoringPage = lazy(() => import('./features/monitoring/pages/MonitoringPage'));
const AnalyticsPage = lazy(() => import('./features/monitoring/pages/AnalyticsPage'));
const ActivityPage = lazy(() => import('./features/activity/pages/ActivityPage'));
const NotificationsPage = lazy(() => import('./features/notifications/pages/NotificationsPage'));
const AdminPage = lazy(() => import('./features/admin/pages/AdminPage'));
const MarketplacePage = lazy(() => import('./features/marketplace/pages/MarketplacePage'));
const AIAssistantPage = lazy(() => import('./features/ai/pages/AIAssistantPage'));
const SQLEditorPage = lazy(() => import('./features/sql/pages/SQLEditorPage'));
const SettingsPage = lazy(() => import('./features/settings/pages/SettingsPage'));
const APIDocumentationPage = lazy(() => import('./features/api/pages/APIDocumentationPage'));
const ProfilePage = lazy(() => import('./features/auth/pages/ProfilePage'));
const AutomlEnginePage = lazy(() => import('./features/scheduling/pages/AutomlEnginePage'));

const PAGE_MAP: Record<string, FC> = {
  Dashboard,
  Search: SearchPage,
  Projects: ProjectsPage,
  'Project Detail': ProjectDetailPage,
  Datasets: DatasetsPage,
  'Data Cleaning': CleaningPage,
  'Auto Cleaning': CleaningPage,
  'Feature Engineering': FeatureEngineeringPage,
  Explorer: ExplorerPage,
  'Dataset Analysis': DatasetAnalysisPage,
  Training: TrainingPage,
  Experiments: ExperimentsPage,
  'HPO Tuning': HyperparameterPage,
  Models: ModelRegistryPage,
  'Model Comparison': ModelComparisonPage,
  'Explainable AI': ExplainableAIPage,
  Deployment: DeploymentsPage,
  'Inference API': PredictionPage,
  Pipelines: PipelinesPage,
  Automations: AutomationsPage,
  Monitoring: MonitoringPage,
  Analytics: AnalyticsPage,
  'Activity': ActivityPage,
  'Notifications': NotificationsPage,
  'Admin': AdminPage,
  Marketplace: MarketplacePage,
  'AI Assistant': AIAssistantPage,
  'SQL Editor': SQLEditorPage,
  Settings: SettingsPage,
  Documentation: APIDocumentationPage,
  Support: AIAssistantPage,
  'Profile': ProfilePage,
  'AutoML Engine': AutomlEnginePage,
};

function CurrentPage() {
  const activePage = useUIStore((s) => s.activePage);
  const Page = PAGE_MAP[activePage] || Dashboard;
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activePage}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="min-w-0"
      >
        <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>}>
          <Page />
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-canvas">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <TopNav />
          <CurrentPage />
        </div>
        <CommandPalette />
      </div>
    </ToastProvider>
  );
}
