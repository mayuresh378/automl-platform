import { Upload, Cpu, Rocket } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';

const ACTIONS = [
  { icon: Upload, label: 'Upload dataset', page: 'Datasets', primary: true },
  { icon: Cpu, label: 'New training run', page: 'Training', primary: false },
  { icon: Rocket, label: 'Deploy a model', page: 'Deployment', primary: false },
];

export function QuickActions() {
  const setActivePage = useUIStore((s) => s.setActivePage);

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            onClick={() => setActivePage(action.page)}
            className={
              action.primary
                ? 'flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity shadow-glow-sm'
                : 'flex items-center gap-2 rounded-lg border border-border bg-white/[0.02] px-4 py-2 text-sm font-medium text-zinc-300 hover:border-border-strong hover:text-white transition-colors'
            }
          >
            <Icon className="h-3.5 w-3.5" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
