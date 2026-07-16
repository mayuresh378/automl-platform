import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Play, Save, Wand2, Sparkles, History, Download, Settings, Keyboard, ChevronDown,
  Search, Database, Columns3, Code2, BarChart3, PanelLeft, PanelRight, PanelBottom,
  ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import { cn } from '../../../lib/cn';
import { Button } from '../../../components/ui/Button';

interface SqlToolbarProps {
  selectedDataset: string;
  datasets: { name: string; filename?: string }[];
  onDatasetChange: (dataset: string) => void;
  onRun: () => void;
  onSave: () => void;
  onFormat: () => void;
  onExplain: () => void;
  onAiAssistant: () => void;
  onToggleHistory: () => void;
  onToggleLeft: () => void;
  onToggleRight: () => void;
  onToggleBottom: () => void;
  onToggleTemplates: () => void;
  onToggleShortcuts: () => void;
  isRunning: boolean;
  leftOpen: boolean;
  rightOpen: boolean;
  bottomOpen: boolean;
}

export const SqlToolbar = memo(function SqlToolbar({
  selectedDataset, datasets, onDatasetChange, onRun, onSave, onFormat,
  onExplain, onAiAssistant, onToggleHistory, onToggleLeft, onToggleRight,
  onToggleBottom, onToggleTemplates, onToggleShortcuts, isRunning, leftOpen, rightOpen, bottomOpen,
}: SqlToolbarProps) {
  return (
    <div className="flex items-center gap-1.5 h-11 px-3 border-b border-border bg-card/80 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-1">
        <div className="relative">
          <select
            value={selectedDataset}
            onChange={(e) => onDatasetChange(e.target.value)}
            className="h-7 pl-7 pr-6 rounded-md bg-white/[0.05] border border-border text-xs text-zinc-300 appearance-none cursor-pointer focus:outline-none focus:border-primary/50"
          >
            <option value="">All datasets</option>
            {(datasets || []).map((d: any) => (
              <option key={d.name || d.filename} value={d.name || d.filename}>
                {d.filename || d.name}
              </option>
            ))}
          </select>
          <Database className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
        </div>
      </div>

      <div className="w-px h-5 bg-border mx-1" />

      <button onClick={onSave} className="toolbar-btn" title="Save (Ctrl+S)">
        <Save className="w-3.5 h-3.5" />
      </button>
      <button onClick={onToggleTemplates} className="toolbar-btn" title="Templates">
        <Code2 className="w-3.5 h-3.5" />
      </button>
      <button onClick={onFormat} className="toolbar-btn" title="Format SQL (Alt+Shift+F)">
        <Wand2 className="w-3.5 h-3.5" />
      </button>
      <button onClick={onExplain} className="toolbar-btn" title="Explain Query">
        <Columns3 className="w-3.5 h-3.5" />
      </button>
      <button onClick={onAiAssistant} className="toolbar-btn" title="AI Assistant">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <button onClick={onToggleHistory} className="toolbar-btn" title="History">
          <History className="w-3.5 h-3.5" />
        </button>
        <div className="relative group">
          <button className="toolbar-btn" title="Export">
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
        <button onClick={onToggleShortcuts} className="toolbar-btn hidden sm:flex" title="Shortcuts">
          <Keyboard className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        <button onClick={onToggleLeft} className={cn('toolbar-btn', !leftOpen && 'opacity-40')} title="Toggle Schema">
          <PanelLeft className="w-3.5 h-3.5" />
        </button>
        <button onClick={onToggleRight} className={cn('toolbar-btn', !rightOpen && 'opacity-40')} title="Toggle AI Assistant">
          <PanelRight className="w-3.5 h-3.5" />
        </button>
        <button onClick={onToggleBottom} className={cn('toolbar-btn', !bottomOpen && 'opacity-40')} title="Toggle Results">
          <PanelBottom className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={onRun}
          disabled={isRunning}
          className="flex items-center gap-1.5 h-7 px-3 rounded-md bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isRunning ? (
            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Play className="w-3 h-3 fill-white" />
          )}
          <span>{isRunning ? 'Running...' : 'Run'}</span>
        </motion.button>
      </div>

      <style>{`
        .toolbar-btn {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 6px;
          color: #a1a1aa; transition: all 0.15s; cursor: pointer;
        }
        .toolbar-btn:hover { background: rgba(255,255,255,0.05); color: #e4e4e7; }
      `}</style>
    </div>
  );
});
