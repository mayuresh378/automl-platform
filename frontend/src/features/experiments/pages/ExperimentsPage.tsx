import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  FlaskConical,
  Play,
  CheckCircle2,
  XCircle,
  Layers,
  Beaker,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import Card from '../../../components/ui/Card';
import { useExperiments } from '../../../hooks/useApi';
import { experimentsService } from '../../../services/experiments.service';
import styles from './ExperimentsPage.module.css';

type Status = 'running' | 'completed' | 'failed' | 'queued';

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.04 } },
};

const rowVariant = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

function formatAccuracy(val: number | null): string {
  if (val === null) return '—';
  return `${(val * 100).toFixed(1)}%`;
}

function accuracyColor(val: number | null): string {
  if (val === null) return 'var(--color-text-tertiary)';
  if (val >= 0.93) return 'var(--color-success)';
  if (val >= 0.85) return 'var(--color-accent)';
  return 'var(--color-warning)';
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return '—';
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

export default function ExperimentsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: experiments = [], isLoading } = useExperiments();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let result = experiments;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.model.toLowerCase().includes(q),
      );
    }
    if (statusFilter) {
      result = result.filter((e) => e.status === statusFilter);
    }
    return result;
  }, [experiments, search, statusFilter]);

  const stats = useMemo(() => ({
    total: experiments.length,
    running: experiments.filter((e) => e.status === 'running').length,
    completed: experiments.filter((e) => e.status === 'completed').length,
    failed: experiments.filter((e) => e.status === 'failed').length,
  }), [experiments]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((e) => e.id)));
    }
  }

  const allSelected = filtered.length > 0 && selected.size === filtered.length;

  function handleCompare() {
    const ids = Array.from(selected);
    experimentsService.compare(ids);
  }

  async function handleDelete(id: string) {
    await experimentsService.delete(id);
    queryClient.invalidateQueries({ queryKey: ['experiments'] });
  }

  function handleRowClick(id: string, e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('input[type="checkbox"]')) return;
    navigate(`/app/experiments/${id}`);
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <motion.div className={styles.header} initial="hidden" animate="visible" variants={fadeIn}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Experiments</h1>
          <p className={styles.subtitle}>Track, compare, and manage your training runs</p>
        </div>
        <button className={styles.newExperimentBtn} type="button">
          <Plus className={styles.btnIcon} />
          New Experiment
        </button>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        className={styles.statsBar}
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        <motion.div className={styles.statCard} variants={fadeIn}>
          <div className={`${styles.statIconWrap} ${styles.statIconWrapTotal}`}>
            <Layers size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>Total Experiments</span>
          </div>
        </motion.div>
        <motion.div className={styles.statCard} variants={fadeIn}>
          <div className={`${styles.statIconWrap} ${styles.statIconWrapRunning}`}>
            <Play size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.running}</span>
            <span className={styles.statLabel}>Running</span>
          </div>
        </motion.div>
        <motion.div className={styles.statCard} variants={fadeIn}>
          <div className={`${styles.statIconWrap} ${styles.statIconWrapCompleted}`}>
            <CheckCircle2 size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.completed}</span>
            <span className={styles.statLabel}>Completed</span>
          </div>
        </motion.div>
        <motion.div className={styles.statCard} variants={fadeIn}>
          <div className={`${styles.statIconWrap} ${styles.statIconWrapFailed}`}>
            <XCircle size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.failed}</span>
            <span className={styles.statLabel}>Failed</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Toolbar */}
      <motion.div className={styles.toolbar} initial="hidden" animate="visible" variants={fadeIn}>
        <div className={styles.toolbarLeft}>
          <div className={styles.searchWrap}>
            <Search className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search experiments, models..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className={`${styles.filterBtn} ${statusFilter === null ? styles.filterBtnActive : ''}`}
            type="button"
            onClick={() => setStatusFilter(null)}
          >
            All
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'running' ? styles.filterBtnActive : ''}`}
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'running' ? null : 'running')}
          >
            Running
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'completed' ? styles.filterBtnActive : ''}`}
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'completed' ? null : 'completed')}
          >
            Completed
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'failed' ? styles.filterBtnActive : ''}`}
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'failed' ? null : 'failed')}
          >
            Failed
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'queued' ? styles.filterBtnActive : ''}`}
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'queued' ? null : 'queued')}
          >
            Queued
          </button>
        </div>
        <div className={styles.toolbarRight}>
          <AnimatePresence>
            {selected.size >= 2 && (
              <motion.button
                className={styles.compareBtn}
                type="button"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onClick={handleCompare}
              >
                <FlaskConical size={16} />
                Compare Selected ({selected.size})
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        className={styles.tableWrap}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        {isLoading ? (
          <div className={styles.emptyState}>
            <Beaker className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>Loading experiments...</p>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={styles.checkboxCell}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={allSelected}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>Experiment Name</th>
                  <th>Status</th>
                  <th>Model</th>
                  <th>Task</th>
                  <th>CV Score</th>
                  <th>Duration</th>
                  <th>Run At</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                <AnimatePresence mode="popLayout">
                  {filtered.map((exp) => (
                    <motion.tr
                      key={exp.id}
                      variants={rowVariant}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      onClick={(e) => handleRowClick(exp.id, e)}
                    >
                      <td className={styles.checkboxCell}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={selected.has(exp.id)}
                          onChange={() => toggleSelect(exp.id)}
                        />
                      </td>
                      <td>
                        <div className={styles.nameCell}>
                          <span className={styles.experimentName}>{exp.name}</span>
                          <span className={styles.experimentDataset}>{exp.dataset}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${styles[`badge${exp.status.charAt(0).toUpperCase() + exp.status.slice(1)}`]}`}>
                          <span className={styles.badgeDot} />
                          {exp.status}
                        </span>
                      </td>
                      <td>
                        <span className={styles.modelBadge}>{exp.model}</span>
                      </td>
                      <td>
                        <span className={styles.monoText}>{exp.task_type}</span>
                      </td>
                      <td>
                        <div className={styles.accuracyCell}>
                          <div className={styles.accuracyBar}>
                            <div
                              className={styles.accuracyFill}
                              style={{
                                width: exp.cv_score != null ? `${exp.cv_score * 100}%` : '0%',
                                background: accuracyColor(exp.cv_score),
                              }}
                            />
                          </div>
                          <span className={styles.accuracyValue} style={{ color: accuracyColor(exp.cv_score) }}>
                            {formatAccuracy(exp.cv_score)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.monoText}>{formatDuration(exp.training_time)}</span>
                      </td>
                      <td>
                        <span className={styles.monoText}>{exp.run_at ?? '—'}</span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className={styles.emptyState}>
                <Beaker className={styles.emptyIcon} />
                <p className={styles.emptyTitle}>No experiments found</p>
                <p className={styles.emptyDesc}>
                  {search ? 'Try a different search term or filter' : 'Create your first experiment to get started'}
                </p>
              </div>
            )}

            {filtered.length > 0 && (
              <div className={styles.resultCount}>
                Showing {filtered.length} of {experiments.length} experiments
                {selected.size > 0 && ` · ${selected.size} selected`}
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
