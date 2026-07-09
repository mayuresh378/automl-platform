import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { CommandPalette } from './components/CommandPalette';
import { Dashboard } from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import CleaningPage from './pages/CleaningPage';
import EngineeringPage from './pages/EngineeringPage';
import ExplorerPage from './pages/ExplorerPage';
import TrainingPage from './pages/TrainingPage';
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
import { useUIStore } from './store/useUIStore';

const PAGE_MAP: Record<string, React.FC> = {
  Dashboard,
  Projects: ProjectsPage,
  Datasets: UploadPage,
  'Data Cleaning': CleaningPage,
  'Feature Engineering': EngineeringPage,
  Training: TrainingPage,
  Experiments: ExperimentsPage,
  Models: ModelRegistryPage,
  Deployment: DeploymentsPage,
  'Inference API': PredictionPage,
  Monitoring: MonitoringPage,
  Pipelines: PipelinesPage,
  Automations: AutomationsPage,
  'AI Assistant': AIAssistantPage,
  Marketplace: MarketplacePage,
  Settings: Dashboard,
};

function CurrentPage() {
  const activePage = useUIStore((s) => s.activePage);
  const Page = PAGE_MAP[activePage];
  return Page ? <Page /> : <Dashboard />;
}

export default function App() {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopNav />
        <CurrentPage />
      </div>
      <CommandPalette />
    </div>
  );
}
