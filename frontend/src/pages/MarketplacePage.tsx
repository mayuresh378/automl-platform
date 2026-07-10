import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Download, Star, Search, BookOpen, Cpu, Database, Wand2, ArrowUpRight, CheckCheck, Zap, TrendingUp, Clock, Filter, Grid3X3, List, X, Tag, ChevronRight, Layers, BarChart3, LineChart, Shield, Sparkles } from 'lucide-react';

const ALL_LISTINGS = [
  { id: '1', name: 'Fraud Detection Pack', type: 'Template', downloads: '2.4k', rating: 4.8, category: 'Solutions', tags: ['classification', 'anomaly'], featured: true, installed: true, author: 'AutoML Labs', desc: 'Pre-built pipeline for detecting fraudulent transactions with ensemble methods.' },
  { id: '2', name: 'NLP Pipeline', type: 'Pipeline', downloads: '1.8k', rating: 4.6, category: 'NLP', tags: ['text', 'embedding'], featured: true, installed: false, author: 'TextAI', desc: 'End-to-end NLP pipeline with BERT embeddings and sentiment analysis.' },
  { id: '3', name: 'Auto Feature Engine', type: 'Component', downloads: '3.1k', rating: 4.9, category: 'Features', tags: ['automation', 'selection'], featured: true, installed: false, author: 'FeatureHub', desc: 'Automatically generates and selects the best features for your dataset.' },
  { id: '4', name: 'Time Series Toolkit', type: 'Toolkit', downloads: '956', rating: 4.5, category: 'Time Series', tags: ['forecast', 'seasonality'], featured: false, installed: true, author: 'TemporalAI', desc: 'Comprehensive toolkit for time series forecasting, decomposition, and anomaly detection.' },
  { id: '5', name: 'XGBoost Optimizer', type: 'Config', downloads: '1.2k', rating: 4.7, category: 'Training', tags: ['boosting', 'hyperparams'], featured: false, installed: false, author: 'BoostML', desc: 'Hyperparameter optimization configs and presets for XGBoost models.' },
  { id: '6', name: 'Dashboard Template', type: 'Template', downloads: '724', rating: 4.3, category: 'Monitoring', tags: ['visualization'], featured: false, installed: true, author: 'VizLabs', desc: 'Real-time monitoring dashboard template with live metrics and alerts.' },
  { id: '7', name: 'CatBoost Config Pack', type: 'Config', downloads: '890', rating: 4.4, category: 'Training', tags: ['boosting', 'categorical'], featured: false, installed: false, author: 'BoostML', desc: 'Optimized configs for CatBoost with automatic categorical encoding.' },
  { id: '8', name: 'Image Classifier', type: 'Pipeline', downloads: '1.5k', rating: 4.6, category: 'Vision', tags: ['cnn', 'image'], featured: true, installed: false, author: 'VisionAI', desc: 'Transfer learning pipeline for image classification using ResNet50.' },
  { id: '9', name: 'Data Profiler Pro', type: 'Component', downloads: '2.1k', rating: 4.7, category: 'Data Quality', tags: ['profiling', 'quality'], featured: false, installed: true, author: 'CleanData', desc: 'Advanced data profiling with distribution analysis, drift detection, and quality scoring.' },
  { id: '10', name: 'Feature Store Connector', type: 'Connector', downloads: '640', rating: 4.2, category: 'Data Connectors', tags: ['storage', 'integration'], featured: false, installed: false, author: 'DataBridge', desc: 'Connect to feature stores like Feast, Tecton, and custom storage backends.' },
  { id: '11', name: 'Ensemble Builder', type: 'Toolkit', downloads: '1.1k', rating: 4.5, category: 'Training', tags: ['ensemble', 'stacking'], featured: false, installed: false, author: 'AutoML Labs', desc: 'Build and optimize model ensembles with stacking, bagging, and voting.' },
  { id: '12', name: 'Drift Monitor', type: 'Component', downloads: '780', rating: 4.4, category: 'Monitoring', tags: ['drift', 'production'], featured: false, installed: false, author: 'MonitorAI', desc: 'Real-time data and model drift detection for production deployments.' },
];

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Grid3X3, count: ALL_LISTINGS.length },
  { id: 'Templates', label: 'Templates', icon: BookOpen, count: ALL_LISTINGS.filter(l => l.type === 'Template').length },
  { id: 'Training', label: 'Training', icon: Cpu, count: ALL_LISTINGS.filter(l => l.category === 'Training').length },
  { id: 'Data Connectors', label: 'Connectors', icon: Database, count: ALL_LISTINGS.filter(l => l.category === 'Data Connectors').length },
  { id: 'Features', label: 'Features', icon: Wand2, count: ALL_LISTINGS.filter(l => l.category === 'Features').length },
  { id: 'Monitoring', label: 'Monitoring', icon: BarChart3, count: ALL_LISTINGS.filter(l => l.category === 'Monitoring').length },
  { id: 'NLP', label: 'NLP', icon: Layers, count: ALL_LISTINGS.filter(l => l.category === 'NLP').length },
  { id: 'Time Series', label: 'Time Series', icon: LineChart, count: ALL_LISTINGS.filter(l => l.category === 'Time Series').length },
  { id: 'Data Quality', label: 'Data Quality', icon: Shield, count: ALL_LISTINGS.filter(l => l.category === 'Data Quality').length },
  { id: 'Vision', label: 'Vision', icon: Sparkles, count: ALL_LISTINGS.filter(l => l.category === 'Vision').length },
];

const TYPES = ['All', 'Templates', 'Components', 'Pipelines', 'Toolkits', 'Configs', 'Connectors'];

function MarketplacePage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeType, setActiveType] = useState('All');
  const [installed, setInstalled] = useState<string[]>(ALL_LISTINGS.filter(l => l.installed).map(l => l.id));
  const [detailId, setDetailId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = useMemo(() => {
    return ALL_LISTINGS.filter(l => {
      if (activeCategory !== 'all' && l.category !== activeCategory) return false;
      if (activeType !== 'All' && l.type !== activeType.replace('s', '')) return false;
      if (search) {
        const q = search.toLowerCase();
        return l.name.toLowerCase().includes(q) || l.desc.toLowerCase().includes(q) || l.tags.some(t => t.includes(q)) || l.author.toLowerCase().includes(q);
      }
      return true;
    });
  }, [activeCategory, activeType, search]);

  const featured = ALL_LISTINGS.filter(l => l.featured);
  const installedItems = ALL_LISTINGS.filter(l => installed.includes(l.id));

  const toggleInstall = (id: string) => {
    setInstalled(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const detail = detailId ? ALL_LISTINGS.find(l => l.id === detailId) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <div className="flex items-center justify-between px-6 pt-2">
        <div>
          <p className="text-sm text-slate-400">Extensions & templates</p>
          <h2 className="text-2xl font-semibold text-white">Marketplace</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search marketplace…" className="rounded-2xl border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-primary/40 w-56" />
          </div>
          <button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} className="rounded-xl border border-white/10 p-2 text-slate-400 hover:text-white transition-colors">
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="px-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm whitespace-nowrap transition-colors ${activeCategory === cat.id ? 'bg-primary/20 text-primary border border-primary/30' : 'text-slate-400 hover:text-white border border-transparent'}`}>
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
                <span className="text-[11px] text-slate-500">({cat.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {featured.length > 0 && !search && activeCategory === 'all' && (
        <section className="px-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold text-white">Featured</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {featured.map(item => (
              <div key={item.id} className="rounded-[28px] border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent p-5 transition hover:border-accent/40 cursor-pointer" onClick={() => setDetailId(item.id)}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-medium text-accent flex items-center gap-1"><Zap className="h-3 w-3" /> Featured</span>
                  <span className="text-[11px] text-slate-500">{item.type}</span>
                </div>
                <p className="font-semibold text-white mb-1">{item.name}</p>
                <p className="text-xs text-slate-400 mb-3 line-clamp-2">{item.desc}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {item.downloads}</span>
                    <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-400" /> {item.rating}</span>
                  </div>
                  <button onClick={e => { e.stopPropagation(); toggleInstall(item.id); }} className={`rounded-xl px-3 py-1 text-xs font-medium transition-colors ${installed.includes(item.id) ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'}`}>
                    {installed.includes(item.id) ? <span className="flex items-center gap-1"><CheckCheck className="h-3 w-3" /> Installed</span> : 'Install'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="px-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-white">{filtered.length} {search || activeCategory !== 'all' ? 'results' : 'available'}</h3>
            {(search || activeCategory !== 'all') && (
              <button onClick={() => { setSearch(''); setActiveCategory('all'); setActiveType('All'); }} className="flex items-center gap-1 text-xs text-slate-500 hover:text-white transition-colors ml-2">
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>
          <div className="flex items-center gap-1">
            {TYPES.map(t => (
              <button key={t} onClick={() => setActiveType(t)} className={`rounded-lg px-2.5 py-1 text-xs transition-colors ${activeType === t ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}>{t}</button>
            ))}
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map(item => (
              <div key={item.id} className="rounded-[28px] border border-white/10 bg-white/5 p-5 transition hover:bg-white/[0.07] hover:border-white/20 cursor-pointer group" onClick={() => setDetailId(item.id)}>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-slate-500">{item.category}</span>
                    <span className="text-[10px] font-mono text-slate-600 bg-white/5 px-1.5 py-0.5 rounded">{item.type}</span>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="font-medium text-white mb-1">{item.name}</p>
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{item.desc}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags.map(t => (
                    <span key={t} className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-slate-500">{t}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {item.downloads}</span>
                    <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-400" /> {item.rating}</span>
                  </div>
                  <button onClick={e => { e.stopPropagation(); toggleInstall(item.id); }} className={`rounded-xl px-2.5 py-1 text-xs font-medium transition-colors ${installed.includes(item.id) ? 'bg-emerald-500/10 text-emerald-400' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>
                    {installed.includes(item.id) ? <span className="flex items-center gap-1"><CheckCheck className="h-3 w-3" /> Installed</span> : 'Install'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(item => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-3 transition hover:bg-white/[0.07] cursor-pointer" onClick={() => setDetailId(item.id)}>
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/5 shrink-0">
                    <Store className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <p className="text-xs text-slate-500 truncate">{item.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-[11px] text-slate-500 hidden sm:block">{item.type}</span>
                  <span className="flex items-center gap-1 text-xs text-slate-500"><Star className="h-3 w-3 text-amber-400" /> {item.rating}</span>
                  <span className="flex items-center gap-1 text-xs text-slate-500"><Download className="h-3 w-3" /> {item.downloads}</span>
                  <button onClick={e => { e.stopPropagation(); toggleInstall(item.id); }} className={`rounded-xl px-2.5 py-1 text-xs font-medium transition-colors ${installed.includes(item.id) ? 'bg-emerald-500/10 text-emerald-400' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>
                    {installed.includes(item.id) ? 'Installed' : 'Install'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-sm text-slate-500">No marketplace items match your search. Try different keywords or filters.</div>
        )}
      </section>

      {installedItems.length > 0 && !search && (
        <section className="px-6 pb-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCheck className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Installed ({installedItems.length})</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {installedItems.map(item => (
              <div key={item.id} className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.type} · v1.0</p>
                </div>
                <button onClick={() => toggleInstall(item.id)} className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] text-slate-400 hover:text-white transition-colors">Remove</button>
              </div>
            ))}
          </div>
        </section>
      )}

      <AnimatePresence>
        {detail && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setDetailId(null)}>
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className="w-full max-w-lg rounded-[32px] border border-white/10 bg-[#111827] p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-accent text-white font-bold text-lg">{detail.name[0]}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{detail.name}</h3>
                    <p className="text-xs text-slate-400">by {detail.author} · {detail.type}</p>
                  </div>
                </div>
                <button onClick={() => setDetailId(null)} className="rounded-xl p-1.5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-slate-300 mb-4">{detail.desc}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {detail.tags.map(t => <span key={t} className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-slate-400 flex items-center gap-1"><Tag className="h-3 w-3" /> {t}</span>)}
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
                  <p className="text-lg font-semibold text-white">{detail.downloads}</p>
                  <p className="text-[10px] text-slate-500">Downloads</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
                  <p className="text-lg font-semibold text-amber-400">{detail.rating}</p>
                  <p className="text-[10px] text-slate-500">Rating</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
                  <p className="text-lg font-semibold text-white">1.0</p>
                  <p className="text-[10px] text-slate-500">Version</p>
                </div>
              </div>
              <button onClick={() => { toggleInstall(detail.id); setDetailId(null); }} className={`w-full rounded-2xl py-3 text-sm font-medium transition-opacity ${installed.includes(detail.id) ? 'bg-white/10 text-slate-300 border border-white/10' : 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90'}`}>
                {installed.includes(detail.id) ? 'Remove installation' : 'Install now'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default MarketplacePage;
