import { useState, useCallback, useRef, useEffect, useMemo, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Database, X, Plus, AlertCircle, Loader2, FileText, History,
  BarChart3, Table2, Timer,
} from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import styles from './SQLEditorPage.module.css';
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
    toggleLeftPanel, toggleRightPanel, toggleBottomPanel, setBottomPanelOpen, setBottomPanelTab,
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
    toggleBottomPanel: s.toggleBottomPanel, setBottomPanelOpen: s.setBottomPanelOpen,
    setBottomPanelTab: s.setBottomPanelTab,
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

  const resolveColumns = useCallback(() => {
    const ds = (datasets || []).find((d: any) => d.name === selectedDataset || d.filename === selectedDataset);
    const cols: string[] = ds?.columns || (datasets?.[0] as any)?.columns || [];
    const firstCol = cols.find((c) => c.toLowerCase() !== 'id') || cols[0] || 'column_name';
    return firstCol;
  }, [datasets, selectedDataset]);

  const resolveTable = useCallback((query: string) => {
    const col = resolveColumns();
    return query
      .replace(/\btable_a\b/g, defaultTableName)
      .replace(/\btable_b\b/g, datasets?.[1]?.name?.replace(/\.\w+$/, '') || 'table_b')
      .replace(/\bdata\b/g, defaultTableName)
      .replace(/\bcolumn_name\b/g, col)
      .replace(/\bvalue\b/g, col);
  }, [defaultTableName, datasets, resolveColumns]);

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
      setBottomPanelOpen(true);
      setBottomPanelTab('results');
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
    <div className={styles.page}>
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

      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={styles.templatesDropdown}
          >
            <div className={styles.templatesList}>
              {queryTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => { handleInsertQuery(resolveTable(tpl.query)); setShowTemplates(false); }}
                  className={styles.templateCard}
                >
                  <div className={styles.templateName}>{tpl.name}</div>
                  <div className={styles.templateDesc}>{tpl.description}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.tabBar}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${styles.tab} ${tab.id === activeTabId ? styles.tabActive : ''}`}
          >
            <FileText className={styles.tabIcon} />
            <span className={styles.tabName}>{tab.name}{tab.isDirty ? ' *' : ''}</span>
            {tabs.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                className={styles.tabClose}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        <button onClick={addTab} className={styles.addTab}>
          <Plus className={styles.tabIcon} />
        </button>
      </div>

      <div className={styles.mainContent}>
        <AnimatePresence>
          {leftPanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: leftPanelWidth, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className={styles.leftPanel}
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
          <div className={styles.resizerVertical} onMouseDown={(e) => handleResizeStart(e, 'left')} />
        )}

        <div className={styles.centerColumn}>
          <div className={styles.editorArea}>
            <SqlEditor
              value={activeTab?.query || ''}
              onChange={(val) => updateTabQuery(activeTabId, val)}
              onMount={handleMonacoMount}
            />
          </div>

          {activeTab?.error && (
            <div className={styles.errorBar}>
              <AlertCircle className={styles.errorIcon} />
              <div className={styles.errorText}>{activeTab.error}</div>
              <button onClick={() => updateTabError(activeTabId, null)} className={styles.errorClose}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {activeTab?.isRunning && (
            <div className={styles.runningBar}>
              <div className={styles.runningSpinner} />
              <span className={styles.runningText}>Running query...</span>
            </div>
          )}

          {bottomPanelOpen && activeTab?.result && (
            <>
              <div className={styles.resizerHorizontal} onMouseDown={(e) => handleResizeStart(e, 'bottom')} />
              <div className={styles.bottomPanel} style={{ height: bottomPanelHeight }}>
                <div className={styles.bottomTabs}>
                  {bottomTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setBottomPanelTab(tab.id)}
                        className={`${styles.bottomTab} ${bottomPanelTab === tab.id ? styles.bottomTabActive : ''}`}
                      >
                        <Icon className={styles.bottomTabIcon} />
                        {tab.label}
                      </button>
                    );
                  })}
                  <div className={styles.bottomTabSpacer} />
                  <button onClick={toggleBottomPanel} className={styles.bottomTabClose}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className={styles.bottomTabContent}>
                  {bottomPanelTab === 'results' && result && <ResultsGrid result={result} />}
                  {bottomPanelTab === 'charts' && result && (
                    <ChartView result={result} chartConfig={chartConfig} setChartConfig={setChartConfig} />
                  )}
                  {bottomPanelTab === 'history' && result && (
                    <div className={styles.historyInfo}>
                      <div className={styles.historyInfoList}>
                        <div className={styles.historyInfoItem}>
                          <Timer className={styles.historyInfoIcon} />
                          <span>Executed in {result.executionTime}ms</span>
                        </div>
                        <div className={styles.historyInfoItem}>
                          <Database className={styles.historyInfoIcon} />
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

        {rightPanelOpen && (
          <div className={styles.resizerVertical} onMouseDown={(e) => handleResizeStart(e, 'right')} />
        )}
        <AnimatePresence>
          {rightPanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: rightPanelWidth, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className={styles.rightPanel}
            >
              <div style={{ width: rightPanelWidth }} className="h-full">
                <AiAssistant onInsertQuery={(q) => handleInsertQuery(resolveTable(q))} currentQuery={activeTab?.query} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
    <div className={styles.chartArea}>
      <div className={styles.chartControls}>
        <select
          value={chartType}
          onChange={(e) => setChartConfig({ type: e.target.value, xKey, yKey })}
          className={styles.chartSelect}
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
          className={styles.chartSelect}
        >
          {strCols.map((c) => <option key={c} value={c}>{c} (X)</option>)}
          {numCols.map((c) => <option key={c} value={c}>{c} (X)</option>)}
        </select>
        <select
          value={yKey}
          onChange={(e) => setChartConfig({ type: chartType, xKey, yKey: e.target.value })}
          className={styles.chartSelect}
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
    <div className={styles.modalBackdrop}>
      <div className={styles.modalOverlay} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={styles.modalContent}
      >
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>Keyboard Shortcuts</span>
          <button onClick={onClose} className={styles.modalClose}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className={styles.modalBody}>
          {KEYBOARD_SHORTCUTS.map((sc) => (
            <div key={sc.key} className={styles.shortcutRow}>
              <span className={styles.shortcutAction}>{sc.action}</span>
              <kbd className={styles.shortcutKey}>
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
