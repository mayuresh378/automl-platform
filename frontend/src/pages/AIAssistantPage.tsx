import { motion } from 'framer-motion';
import { Sparkles, Database, Brain, BarChart3, Lightbulb } from 'lucide-react';
import { AIAssistantPanel } from '../components/AIAssistantPanel';

const CAPABILITIES = [
  { icon: Database, label: 'Analyze datasets', desc: 'Profile, clean, and understand your data' },
  { icon: Brain, label: 'Model recommendations', desc: 'Get the right algorithm for your task' },
  { icon: BarChart3, label: 'Experiment insights', desc: 'Compare runs and explain performance' },
  { icon: Lightbulb, label: 'Feature suggestions', desc: 'Engineer better features automatically' },
];

function AIAssistantPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="p-6 h-full">
      <div className="mb-6">
        <p className="text-sm text-slate-400">AI-powered insights</p>
        <h2 className="text-2xl font-semibold text-white">AI Assistant</h2>
      </div>
      <div className="grid lg:grid-cols-[1fr_280px] gap-6 h-[calc(100vh-12rem)]">
        <AIAssistantPanel />
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card/60 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-zinc-100">Capabilities</span>
            </div>
            <div className="space-y-3">
              {CAPABILITIES.map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.label} className="flex gap-2.5">
                    <Icon className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[13px] font-medium text-zinc-200">{c.label}</p>
                      <p className="text-[11px] text-zinc-500">{c.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card/60 p-4">
            <span className="text-sm font-medium text-zinc-100">Tips</span>
            <ul className="mt-2 space-y-1.5 text-[12px] text-zinc-500">
              <li>• Ask about specific datasets by name</li>
              <li>• Request model comparisons</li>
              <li>• Get cleaning recommendations</li>
              <li>• Suggest features for any dataset</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default AIAssistantPage;
