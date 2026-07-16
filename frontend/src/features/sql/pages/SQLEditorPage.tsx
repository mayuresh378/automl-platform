import { useState, useCallback, useRef, useEffect, useMemo, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Database, X, Plus, AlertCircle, Loader2, FileText, History,
  BarChart3, Table2, Timer,
} from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '../../../lib/cn';
import { datasetsService } from '../../../services/datasets.service';
import { useNotification } from '../../../hooks/useNotification';
import { useSqlEditorStore } from '../store/useSqlEditorStore';
import { sqlService } from '../services/sqlEditor.service';
import { SchemaExplorer } from '../components/SchemaExplorer';
import { SqlToolbar } from '../components/SqlToolbar';
import { SqlEditor } from '../components/SqlEditor';
import { AiAssistant } from '../components/AiAssistant';
import { ResultsGrid } from '../components/ResultsGrid';
import { QueryHistory } from '../components/QueryHistory';
import { QUERY_TEMPLATES, KEYBOARD_SHORTCUTS, QueryResult } from '../types';
import {
  BarChart, PieChart as RePie, LineChart as ReLine, AreaChart, ScatterChart,
  Bar, Pie, Line, Area, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell,
} from 'recharts';

const CHART_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6', '#f97316'];

export default function SQLEditorPage() {
  const { notifyError, notifySuccess } = useNotification();
  const [selectedDataset, setSelectedDataset] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [chartConfig, setChartConfig] = useState<{ type: string; xKey: string; yKey: string } | null>(null);
  const [queryTemplates, setQueryTemplates] = useState(QUERY_TEMPLATES);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const resizerRef = useRef<{ startX?: number; startY?: number; panel?: string }>({});

  const {
    tabs, activeTabId, leftPanelOpen, rightPanelOpen, bottomPanelOpen, bottomPanelTab,
    leftPanelWidth, rightPanelWidth, bottomPanelHeight,
    addTab, closeTab, setActiveTab, updateTabQuery, updateTabResult, updateTabError, updateTabRunning,
    renameTab, duplicateTab,
    toggleLeftPanel, toggleRightPanel, toggleBottomPanel, setBottomPanelTab,
    setLeftPanelWidth, setRightPanelWidth, setBottomPanelHeight,
  } = useSqlEditorStore(useShallow((s) => ({
    tabs: s.tabs, activeTabId: s.activeTabId, leftPanelOpen: s.leftPanelOpen,
    rightPanelOpen: s.rightPanelOpen, bottomPanelOpen: s.bottomPanelOpen,
    bottomPanelTab: s.bottomPanelTab, leftPanelWidth: s.leftPanelWidth,
    rightPanelWidth: s.rightPanelWidth, bottomPanelHeight: s.bottomPanelHeight,
    addTab: s.addTab, closeTab: s.closeTab, setActiveTab: s.setActiveTab,
    updateTabQuery: s.updateTabQuery, updateTabResult: s.updateTabResult,
    updateTabError: s.updateTabError, updateTabRunning: s.updateTabRunning,
    renameTab: s.renameTab, duplicateTab: s.duplicateTab,
    toggleLeftPanel: s.toggleLeftPanel, toggleRightPanel: s.toggleRightPanel,
    toggleBottomPanel: s.toggleBottomPanel, setBottomPanelTab: s.setBottomPanelTab,
    setLeftPanelWidth: s.setLeftPanelWidth, setRightPanelWidth: s.setRightPanelWidth,
    setBottomPanelHeight: s.setBottomPanelHeight,
  })));

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const { data: datasets } = useQuery({
    queryKey: ['datasets'],
    queryFn: () => datasetsService.list(),
    select: (d: any) => d.datasets,
  });

  const defaultTableName = useMemo(() => {
    if (selectedDataset) return 'data';
    if (datasets?.length) {
      const f = datasets[0].name || datasets[0].filename;
      return f ? f.replace(/\.\w+$/, '') : 'data';
    }
    return 'data';
  }, [selectedDataset, datasets]);

  const resolveTable = useCallback((query: string) => {
    return query.replace(/\btable_a\b/g, defaultTableName).replace(/\btable_b\b/g, datasets?.[1]?.name?.replace(/\.\w+$/, '') || 'table_b').replace(/\bdata\b/g, defaultTableName);
  }, [defaultTableName, datasets]);

  const handleRun = useCallback(async () => {
    if (!activeTab?.query?.trim()) return;
    updateTabRunning(activeTabId, true);
    updateTabResult(activeTabId, null);
    updateTabError(activeTabId, null);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);
      const data = await sqlService.executeQuery(activeTab.query.trim(), selectedDataset, controller.signal);
      clearTimeout(timeout);
      updateTabResult(activeTabId, data);
      sqlService.addToHistory({ query: activeTab.query.trim(), dataset: selectedDataset, executionTime: data.executionTime, rowsReturned: data.rows, favorite: false, pinned: false });
      notifySuccess('Query completed', `${data.rows} row(s) returned in ${data.executionTime}ms`);
    } catch (err: any) {
      const msg = err.name === 'AbortError' ? 'Query timed out after 60s' : err.message || String(err);
      updateTabError(activeTabId, msg);
      notifyError('Query failed', msg);
    } finally {
      updateTabRunning(activeTabId, false);
    }
  }, [activeTab, activeTabId, selectedDataset, updateTabRunning, updateTabResult, updateTabError, notifySuccess, notifyError]);

  const handleFormat = useCallback(() => {
    if (editorRef.current && monacoRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  }, []);

  const handleMonacoMount = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    editor.addAction({
      id: 'run-query-action',
      label: 'Run Query',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => handleRun(),
    });
  }, [handleRun]);

  const handleInsertQuery = useCallback((text: string) => {
    if (editorRef.current) {
      const selection = editorRef.current.getSelection();
      const range = new monacoRef.current.Range(
        selection.startLineNumber, selection.startColumn,
        selection.endLineNumber, selection.endColumn,
      );
      editorRef.current.executeEdits('insert', [{ range, text }]);
    } else {
      updateTabQuery(activeTabId, (activeTab?.query || '') + text);
    }
  }, [activeTabId, activeTab]);

  const handleTableClick = useCallback((tableName: string) => {
    const name = selectedDataset ? 'data' : tableName;
    handleInsertQuery(`SELECT *\nFROM ${name}\nLIMIT 100;`);
  }, [handleInsertQuery, selectedDataset]);

  const handleColumnClick = useCallback((columnName: string) => {
    if (columnName === '*') {
      handleInsertQuery('*');
    } else {
      handleInsertQuery(columnName);
    }
  }, [handleInsertQuery]);

  const handleRestoreQuery = useCallback((query: string) => {
    updateTabQuery(activeTabId, query);
    setShowHistory(false);
  }, [activeTabId, updateTabQuery]);

  const handleAiAssistantToggle = useCallback(() => {
    toggleRightPanel();
  }, [toggleRightPanel]);

  const handleExport = useCallback((format: string) => {
    if (!activeTab?.result?.data?.length) return;
    if (format === 'csv') sqlService.exportCSV(activeTab.result.data, `query_${Date.now()}`);
    else if (format === 'json') sqlService.exportJSON(activeTab.result.data, `query_${Date.now()}`);
    else if (format === 'sql') sqlService.exportSQL(activeTab.query, `query_${Date.now()}`);
    else if (format === 'clipboard') sqlService.copyToClipboard(activeTab.query);
  }, [activeTab]);

  // Resizer handlers
  const handleResizeStart = useCallback((e: React.MouseEvent, panel: string) => {
    e.preventDefault();
    resizerRef.current = { startX: e.clientX, startY: e.clientY, panel };
    const handler = (ev: MouseEvent) => {
      if (!resizerRef.current) return;
      const deltaX = ev.clientX - (resizerRef.current.startX || 0);
      const deltaY = ev.clientY - (resizerRef.current.startY || 0);
      if (resizerRef.current.panel === 'left') {
        setLeftPanelWidth(Math.max(200, Math.min(500, leftPanelWidth + deltaX)));
      } else if (resizerRef.current.panel === 'right') {
        setRightPanelWidth(Math.max(250, Math.min(500, rightPanelWidth - deltaX)));
      } else if (resizerRef.current.panel === 'bottom') {
        setBottomPanelHeight(Math.max(100, Math.min(600, bottomPanelHeight - deltaY)));
      }
      resizerRef.current.startX = ev.clientX;
      resizerRef.current.startY = ev.clientY;
    };
    const upHandler = () => {
      resizerRef.current = {};
      document.removeEventListener('mousemove', handler);
      document.removeEventListener('mouseup', upHandler);
    };
    document.addEventListener('mousemove', handler);
    document.addEventListener('mouseup', upHandler);
  }, [leftPanelWidth, rightPanelWidth, bottomPanelHeight, setLeftPanelWidth, setRightPanelWidth, setBottomPanelHeight]);

  const bottomTabs = [
    { id: 'results', label: 'Results', icon: Table2 },
    { id: 'charts', label: 'Charts', icon: BarChart3 },
    { id: 'history', label: 'History', icon: History },
  ];

  const result = activeTab?.result;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Toolbar */}
      <SqlToolbar
        selectedDataset={selectedDataset}
        datasets={datasets || []}
        onDatasetChange={setSelectedDataset}
        onRun={handleRun}
        onSave={() => {}}
        onFormat={handleFormat}
        onExplain={() => setBottomPanelTab('results')}
        onAiAssistant={handleAiAssistantToggle}
        onToggleHistory={() => setShowHistory(true)}
        onToggleLeft={toggleLeftPanel}
        onToggleRight={toggleRightPanel}
        onToggleBottom={toggleBottomPanel}
        onToggleTemplates={() => setShowTemplates(!showTemplates)}
        onToggleShortcuts={() => setShowShortcuts(true)}
        isRunning={activeTab?.isRunning || false}
        leftOpen={leftPanelOpen}
        rightOpen={rightPanelOpen}
        bottomOpen={bottomPanelOpen}
      />

      {/* Templates dropdown */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border bg-card/80 backdrop-blur-sm"
          >
            <div className="flex gap-2 p-2 overflow-x-auto scrollbar-thin">
              {queryTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => { handleInsertQuery(resolveTable(tpl.query)); setShowTemplates(false); }}
                  className="flex-shrink-0 px-3 py-2 rounded-lg bg-sidebar-hover hover:bg-white/[0.08] transition-colors text-left"
                >
                  <div className="text-xs font-medium text-zinc-300">{tpl.name}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{tpl.description}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab bar */}
      <div className="flex items-center h-9 bg-card border-b border-border shrink-0 overflow-x-auto scrollbar-thin">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 h-full border-r border-border cursor-pointer select-none group shrink-0',
              tab.id === activeTabId ? 'bg-canvas text-zinc-200' : 'text-zinc-500 hover:text-zinc-300 hover:bg-sidebar-hover',
            )}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs whitespace-nowrap">{tab.name}{tab.isDirty ? ' *' : ''}</span>
            {tabs.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                className="p-0.5 rounded hover:bg-white/[0.1] opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        <button onClick={addTab} className="flex items-center justify-center h-full px-2 text-zinc-500 hover:text-zinc-300 hover:bg-sidebar-hover">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Schema Explorer */}
        <AnimatePresence>
          {leftPanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: leftPanelWidth, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-r border-border bg-card shrink-0 overflow-hidden"
            >
              <div style={{ width: leftPanelWidth }} className="h-full">
                <SchemaExplorer
                  datasets={datasets || []}
                  onTableClick={handleTableClick}
                  onColumnClick={handleColumnClick}
                  editorRef={editorRef}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {leftPanelOpen && (
          <div className="w-1.5 shrink-0 cursor-col-resize hover:bg-primary/20 transition-colors" onMouseDown={(e) => handleResizeStart(e, 'left')} />
        )}

        {/* Center - Editor + Results */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Monaco Editor */}
          <div className="flex-1 min-h-[120px]">
            <SqlEditor
              value={activeTab?.query || ''}
              onChange={(val) => updateTabQuery(activeTabId, val)}
              onMount={handleMonacoMount}
            />
          </div>

          {/* Error display */}
          {activeTab?.error && (
            <div className="px-4 py-2 bg-danger/10 border-t border-danger/30 flex items-start gap-2 shrink-0">
              <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-300 flex-1">{activeTab.error}</div>
              <button onClick={() => updateTabError(activeTabId, null)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Running indicator */}
          {activeTab?.isRunning && (
            <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/5 border-t border-primary/20 shrink-0">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              <span className="text-xs text-zinc-400">Running query...</span>
            </div>
          )}

          {/* Bottom Panel - Results/Charts/History */}
          {bottomPanelOpen && activeTab?.result && (
            <>
              <div className="h-1.5 shrink-0 cursor-row-resize hover:bg-primary/20 transition-colors" onMouseDown={(e) => handleResizeStart(e, 'bottom')} />
              <div className="border-t border-border bg-card flex flex-col shrink-0" style={{ height: bottomPanelHeight }}>
                {/* Bottom tabs */}
                <div className="flex items-center h-9 border-b border-border bg-card/80 shrink-0 px-2">
                  {bottomTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setBottomPanelTab(tab.id)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 h-full text-xs border-b-2 transition-colors',
                          bottomPanelTab === tab.id
                            ? 'border-primary text-zinc-200'
                            : 'border-transparent text-zinc-500 hover:text-zinc-300',
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {tab.label}
                      </button>
                    );
                  })}
                  <div className="flex-1" />
                  <button onClick={toggleBottomPanel} className="p-1 rounded hover:bg-sidebar-hover text-zinc-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-hidden">
                  {bottomPanelTab === 'results' && result && <ResultsGrid result={result} />}
                  {bottomPanelTab === 'charts' && result && (
                    <ChartView result={result} chartConfig={chartConfig} setChartConfig={setChartConfig} />
                  )}
                  {bottomPanelTab === 'history' && result && (
                    <div className="p-3 text-xs text-zinc-500 overflow-y-auto h-full">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Timer className="w-3.5 h-3.5" />
                          <span>Executed in {result.executionTime}ms</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Database className="w-3.5 h-3.5" />
                          <span>{result.rows} rows returned</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right panel - AI Assistant */}
        {rightPanelOpen && (
          <div className="w-1.5 shrink-0 cursor-col-resize hover:bg-primary/20 transition-colors" onMouseDown={(e) => handleResizeStart(e, 'right')} />
        )}
        <AnimatePresence>
          {rightPanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: rightPanelWidth, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-border bg-card shrink-0 overflow-hidden"
            >
              <div style={{ width: rightPanelWidth }} className="h-full">
                <AiAssistant onInsertQuery={handleInsertQuery} currentQuery={activeTab?.query} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showHistory && (
          <QueryHistory onRestoreQuery={handleRestoreQuery} onClose={() => setShowHistory(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showShortcuts && (
          <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function ChartView({
  result, chartConfig, setChartConfig,
}: {
  result: QueryResult; chartConfig: { type: string; xKey: string; yKey: string } | null;
  setChartConfig: (c: { type: string; xKey: string; yKey: string } | null) => void;
}) {
  const columns = result.columns;
  const numCols = columns.filter((c) => result.data.some((r) => typeof r[c] === 'number'));
  const strCols = columns.filter((c) => !numCols.includes(c));
  const xKey = chartConfig?.xKey || strCols[0] || columns[0];
  const yKey = chartConfig?.yKey || numCols[0] || columns[columns.length - 1];
  const chartType = chartConfig?.type || 'bar';

  const data = result.data.slice(0, 100);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-card/50 shrink-0">
        <select
          value={chartType}
          onChange={(e) => setChartConfig({ type: e.target.value, xKey, yKey })}
          className="h-7 rounded text-[11px] bg-white/[0.05] border border-border text-zinc-300 px-2 focus:outline-none"
        >
          <option value="bar">Bar</option>
          <option value="pie">Pie</option>
          <option value="line">Line</option>
          <option value="area">Area</option>
          <option value="scatter">Scatter</option>
        </select>
        <select
          value={xKey}
          onChange={(e) => setChartConfig({ type: chartType, xKey: e.target.value, yKey })}
          className="h-7 rounded text-[11px] bg-white/[0.05] border border-border text-zinc-300 px-2 focus:outline-none"
        >
          {strCols.map((c) => <option key={c} value={c}>{c} (X)</option>)}
          {numCols.map((c) => <option key={c} value={c}>{c} (X)</option>)}
        </select>
        <select
          value={yKey}
          onChange={(e) => setChartConfig({ type: chartType, xKey, yKey: e.target.value })}
          className="h-7 rounded text-[11px] bg-white/[0.05] border border-border text-zinc-300 px-2 focus:outline-none"
        >
          {numCols.map((c) => <option key={c} value={c}>{c} (Y)</option>)}
        </select>
      </div>
      <div className="flex-1 p-3">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: '#71717a' }} />
              <YAxis tick={{ fontSize: 10, fill: '#71717a' }} />
              <Tooltip />
              <Bar dataKey={yKey} fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : chartType === 'pie' ? (
            <RePie>
              <Pie data={data} dataKey={yKey} nameKey={xKey} cx="50%" cy="50%" outerRadius={100} label>
                {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </RePie>
          ) : chartType === 'line' ? (
            <ReLine data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: '#71717a' }} />
              <YAxis tick={{ fontSize: 10, fill: '#71717a' }} />
              <Tooltip />
              <Line type="monotone" dataKey={yKey} stroke="#3b82f6" strokeWidth={2} dot={false} />
            </ReLine>
          ) : chartType === 'area' ? (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: '#71717a' }} />
              <YAxis tick={{ fontSize: 10, fill: '#71717a' }} />
              <Tooltip />
              <Area type="monotone" dataKey={yKey} stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
            </AreaChart>
          ) : (
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: '#71717a' }} />
              <YAxis dataKey={yKey} tick={{ fontSize: 10, fill: '#71717a' }} />
              <Tooltip />
              <Scatter data={data} fill="#3b82f6" />
            </ScatterChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function KeyboardShortcutsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-[400px] rounded-lg border border-border bg-card shadow-dropdown overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-medium text-zinc-200">Keyboard Shortcuts</span>
          <button onClick={onClose} className="p-1 rounded hover:bg-sidebar-hover text-zinc-500">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-3 space-y-1">
          {KEYBOARD_SHORTCUTS.map((sc) => (
            <div key={sc.key} className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-sidebar-hover">
              <span className="text-xs text-zinc-400">{sc.action}</span>
              <kbd className="px-2 py-0.5 rounded bg-white/[0.05] border border-border text-[10px] font-mono text-zinc-300">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
