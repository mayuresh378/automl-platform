import { Upload, Cpu, Rocket } from 'lucide-react';

const ACTIONS = [
  { icon: Upload, label: 'Upload dataset', primary: true },
  { icon: Cpu, label: 'New training run', primary: false },
  { icon: Rocket, label: 'Deploy a model', primary: false },
];

export function QuickActions() {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
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
