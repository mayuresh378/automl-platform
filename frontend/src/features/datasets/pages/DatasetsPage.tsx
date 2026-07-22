import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion, Reorder } from 'framer-motion';
import { TiltCard, MagneticButton } from '../../../components/motion';
import Card from '../../../components/ui/Card';
import { useDatasets } from '../../../hooks/useApi';
import { datasetsService } from '../../../services/datasets.service';
import styles from './DatasetsPage.module.css';

type FilterStatus = 'all' | 'processed' | 'pending' | 'failed';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const formatNumber = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(1)}K`
      : String(n);

const formatFileSize = (sizeKb: number) =>
  sizeKb >= 1024
    ? `${(sizeKb / 1024).toFixed(1)} MB`
    : `${sizeKb.toFixed(1)} KB`;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const statusClass: Record<string, string> = {
  processed: styles.statusProcessed,
  ready: styles.statusProcessed,
  pending: styles.statusPending,
  processing: styles.statusPending,
  failed: styles.statusFailed,
  error: styles.statusFailed,
};

const statusLabel = (status: string) =>
  status.charAt(0).toUpperCase() + status.slice(1);

export default function DatasetsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [uploading, setUploading] = useState(false);

  const { data: rawDatasets, isLoading, isError } = useDatasets();

  const datasets = useMemo(() => {
    if (!rawDatasets) return [];
    return rawDatasets.filter((d) => {
      const query = search.toLowerCase();
      const matchesSearch =
        !query ||
        d.filename?.toLowerCase().includes(query) ||
        d.original_filename?.toLowerCase().includes(query);
      const matchesFilter =
        filter === 'all' || d.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [rawDatasets, search, filter]);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await datasetsService.upload(file);
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this dataset?')) return;
    try {
      await datasetsService.remove(name);
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const statusFilters: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'processed', label: 'Processed' },
    { key: 'pending', label: 'Pending' },
    { key: 'failed', label: 'Failed' },
  ];

  return (
    <div className={styles.page}>
      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept=".csv,.tsv,.json,.xlsx,.xls,.parquet"
        onChange={handleFileChange}
      />

      {/* Header */}
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div>
          <h1 className={styles.title}>Datasets</h1>
          <p className={styles.subtitle}>Manage and explore your data sources</p>
        </div>
        <MagneticButton
          className={styles.uploadButton}
          onClick={handleUploadClick}
          strength={0.2}
        >
          <span className={styles.uploadIcon}>+</span>
          {uploading ? 'Uploading...' : 'Upload Dataset'}
        </MagneticButton>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        className={styles.toolbar}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search datasets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          {statusFilters.map((f) => (
            <button
              key={f.key}
              className={
                filter === f.key ? styles.filterButtonActive : styles.filterButton
              }
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <span className={styles.resultCount}>
          {datasets.length} dataset{datasets.length !== 1 && 's'}
        </span>
      </motion.div>

      {/* Loading */}
      {isLoading && (
        <motion.div
          className={styles.emptyState}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.emptyIcon}>⏳</div>
          <h3 className={styles.emptyTitle}>Loading datasets...</h3>
        </motion.div>
      )}

      {/* Error */}
      {isError && (
        <motion.div
          className={styles.emptyState}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.emptyIcon}>⚠️</div>
          <h3 className={styles.emptyTitle}>Failed to load datasets</h3>
          <p className={styles.emptyDescription}>
            Something went wrong while fetching your datasets.
          </p>
          <button
            className={styles.emptyAction}
            onClick={() => queryClient.invalidateQueries({ queryKey: ['datasets'] })}
          >
            Retry
          </button>
        </motion.div>
      )}

      {/* Grid / Empty */}
      {!isLoading && !isError && (
        datasets.length === 0 ? (
          <motion.div
            className={styles.emptyState}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.emptyIcon}>📂</div>
            <h3 className={styles.emptyTitle}>No datasets found</h3>
            <p className={styles.emptyDescription}>
              Try adjusting your search or filters, or upload a new dataset to get
              started.
            </p>
            <button
              className={styles.emptyAction}
              onClick={handleUploadClick}
            >
              Upload Dataset
            </button>
          </motion.div>
        ) : (
          <Reorder.Group
            axis="y"
            values={datasets}
            onReorder={() => {}}
            className={styles.grid}
          >
            {datasets.map((dataset) => (
              <Reorder.Item
                key={dataset.id}
                value={dataset}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                whileDrag={{ scale: 1.03, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', zIndex: 10 }}
                style={{ listStyle: 'none' }}
              >
                <TiltCard glareColor="rgba(79,70,229,0.08)" maxTilt={4} scale={1.01}>
                  <div
                    className={styles.datasetCard}
                    onClick={() => navigate(`/datasets/${dataset.id}`)}
                  >
                    <Card>
                      <div className={styles.cardTop}>
                        <span className={styles.name} title={dataset.original_filename || dataset.filename}>
                          {dataset.original_filename || dataset.filename}
                        </span>
                        <span
                          className={`${styles.statusBadge} ${statusClass[dataset.status] || ''}`}
                        >
                          <span className={styles.statusDot} />
                          {statusLabel(dataset.status)}
                        </span>
                      </div>

                      <div className={styles.cardStats}>
                        <div className={styles.statItem}>
                          <span className={styles.statValue}>
                            {formatNumber(dataset.rows)}
                          </span>
                          <span className={styles.statLabel}>Rows</span>
                        </div>
                        <div className={styles.statItem}>
                          <span className={styles.statValue}>
                            {formatNumber(Array.isArray(dataset.columns) ? dataset.columns.length : dataset.columns)}
                          </span>
                          <span className={styles.statLabel}>Columns</span>
                        </div>
                        <div className={styles.statItem}>
                          <span className={styles.statValue}>
                            {formatFileSize(dataset.file_size_kb)}
                          </span>
                          <span className={styles.statLabel}>Size</span>
                        </div>
                      </div>

                      <hr className={styles.cardDivider} />

                      <div className={styles.cardFooter}>
                        <span className={styles.createdAt}>
                          {formatDate(dataset.created_at)}
                        </span>
                        <div>
                          <button
                            className={styles.viewAction}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/datasets/${dataset.id}`);
                            }}
                          >
                            View Details →
                          </button>
                        </div>
                      </div>
                    </Card>
                  </div>
                </TiltCard>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )
      )}
    </div>
  );
}
