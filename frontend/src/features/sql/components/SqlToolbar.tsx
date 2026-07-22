import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Play, Save, Wand2, Sparkles, History, Download, Settings, Keyboard, ChevronDown,
  Search, Database, Columns3, Code2, BarChart3, PanelLeft, PanelRight, PanelBottom,
  ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import styles from './SqlToolbar.module.css';
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
    <div className={styles.toolbar}>
      <div className={styles.datasetGroup}>
        <div className={styles.datasetWrapper}>
          <select
            value={selectedDataset}
            onChange={(e) => onDatasetChange(e.target.value)}
            className={styles.datasetSelect}
          >
            <option value="">All datasets</option>
            {(datasets || []).map((d: any) => (
              <option key={d.name || d.filename} value={d.name || d.filename}>
                {d.filename || d.name}
              </option>
            ))}
          </select>
          <Database className={styles.datasetIcon} />
          <ChevronDown className={styles.datasetChevron} />
        </div>
      </div>

      <div className={styles.divider} />

      <button onClick={onSave} className={styles.btn} title="Save (Ctrl+S)">
        <Save className={styles.btnIcon} />
      </button>
      <button onClick={onToggleTemplates} className={styles.btn} title="Templates">
        <Code2 className={styles.btnIcon} />
      </button>
      <button onClick={onFormat} className={styles.btn} title="Format SQL (Alt+Shift+F)">
        <Wand2 className={styles.btnIcon} />
      </button>
      <button onClick={onExplain} className={styles.btn} title="Explain Query">
        <Columns3 className={styles.btnIcon} />
      </button>
      <button onClick={onAiAssistant} className={`${styles.btn} ${styles.btnAccent}`} title="AI Assistant">
        <Sparkles className={styles.btnIcon} />
      </button>

      <div className={styles.spacer} />

      <div className={styles.datasetGroup}>
        <button onClick={onToggleHistory} className={styles.btn} title="History">
          <History className={styles.btnIcon} />
        </button>
        <div className="relative group">
          <button className={styles.btn} title="Export">
            <Download className={styles.btnIcon} />
          </button>
        </div>
        <button onClick={onToggleShortcuts} className={`${styles.btn} hidden sm:flex`} title="Shortcuts">
          <Keyboard className={styles.btnIcon} />
        </button>

        <div className={styles.divider} />

        <button onClick={onToggleLeft} className={`${styles.btn} ${!leftOpen ? styles.panelToggleInactive : ''}`} title="Toggle Schema">
          <PanelLeft className={styles.btnIcon} />
        </button>
        <button onClick={onToggleRight} className={`${styles.btn} ${!rightOpen ? styles.panelToggleInactive : ''}`} title="Toggle AI Assistant">
          <PanelRight className={styles.btnIcon} />
        </button>
        <button onClick={onToggleBottom} className={`${styles.btn} ${!bottomOpen ? styles.panelToggleInactive : ''}`} title="Toggle Results">
          <PanelBottom className={styles.btnIcon} />
        </button>

        <div className={styles.divider} />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={onRun}
          disabled={isRunning}
          className={styles.runBtn}
        >
          {isRunning ? (
            <div className={styles.runSpinner} />
          ) : (
            <Play className={styles.runBtnIcon} />
          )}
          <span>{isRunning ? 'Running...' : 'Run'}</span>
        </motion.button>
      </div>
    </div>
  );
});
