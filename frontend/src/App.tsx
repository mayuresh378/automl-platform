import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { CommandPalette } from './components/CommandPalette';
import { ToastProvider } from './components/ToastProvider';
import { Dashboard } from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import CleaningPage from './pages/CleaningPage';
import EngineeringPage from './pages/EngineeringPage';
import ExplorerPage from './pages/ExplorerPage';
import DatasetAnalysisPage from './pages/DatasetAnalysisPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AdminPage from './pages/AdminPage';
import ModelComparisonPage from './pages/ModelComparisonPage';
import ExplainableAIPage from './pages/ExplainableAIPage';
import TrainingPage from './pages/TrainingPage';
import HyperparameterPage from './pages/HyperparameterPage';
import AutomlEnginePage from './pages/AutomlEnginePage';
import PredictionPage from './pages/PredictionPage';
import MonitoringPage from './pages/MonitoringPage';
import ExperimentsPage from './pages/ExperimentsPage';
import ModelRegistryPage from './pages/ModelRegistryPage';
import DeploymentsPage from './pages/DeploymentsPage';
import ProjectsPage from './pages/ProjectsPage';
import PipelinesPage from './pages/PipelinesPage';
import AutomationsPage from './pages/AutomationsPage';
import AIAssistantPage from './pages/AIAssistantPage';
import MarketplacePage from './pages/MarketplacePage';
import SQLEditorPage from './pages/SQLEditorPage';
import SettingsPage from './pages/SettingsPage';
import APIDocumentationPage from './pages/APIDocumentationPage';
import { AnimatePresence, motion } from 'framer-motion';
import { useUIStore } from './store/useUIStore';

const PAGE_MAP: Record<string, React.FC> = {
  Dashboard,
  Projects: ProjectsPage,
  Datasets: UploadPage,
  'Data Cleaning': CleaningPage,
  'Feature Engineering': EngineeringPage,
  Explorer: ExplorerPage,
  'Dataset Analysis': DatasetAnalysisPage,
  'Project Detail': ProjectDetailPage,
  'Model Comparison': ModelComparisonPage,
  'Explainable AI': ExplainableAIPage,
  'Analytics': AnalyticsPage,
  'Admin': AdminPage,
  Training: TrainingPage,
  'HPO Tuning': HyperparameterPage,
  'AutoML Engine': AutomlEnginePage,
  Experiments: ExperimentsPage,
  Models: ModelRegistryPage,
  Deployment: DeploymentsPage,
  'Inference API': PredictionPage,
  Monitoring: MonitoringPage,
  Pipelines: PipelinesPage,
  Automations: AutomationsPage,
  'AI Assistant': AIAssistantPage,
  Marketplace: MarketplacePage,
  'SQL Editor': SQLEditorPage,
  Settings: SettingsPage,
  Documentation: APIDocumentationPage,
  Support: AIAssistantPage,
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
        <Page />
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
