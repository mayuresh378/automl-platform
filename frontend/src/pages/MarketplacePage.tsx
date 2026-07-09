import { motion } from 'framer-motion';
import { Store, Download, Star, Search, BookOpen, Cpu, Database, Wand2 } from 'lucide-react';

function MarketplacePage() {
  const listings = [
    { name: 'Fraud Detection Pack', type: 'Template', downloads: '2.4k', rating: 4.8, category: 'Solutions' },
    { name: 'NLP Pipeline', type: 'Pipeline', downloads: '1.8k', rating: 4.6, category: 'NLP' },
    { name: 'Auto Feature Engine', type: 'Component', downloads: '3.1k', rating: 4.9, category: 'Features' },
    { name: 'Time Series Toolkit', type: 'Toolkit', downloads: '956', rating: 4.5, category: 'Time Series' },
    { name: 'XGBoost Optimizer', type: 'Config', downloads: '1.2k', rating: 4.7, category: 'Training' },
    { name: 'Dashboard Template', type: 'Template', downloads: '724', rating: 4.3, category: 'Monitoring' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6 p-6">
      <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Extensions & templates</p>
            <h2 className="text-2xl font-semibold text-white">Marketplace</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              placeholder="Search marketplace…"
              className="rounded-2xl border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-primary/40 w-64"
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((item) => (
            <div key={item.name} className="rounded-[28px] border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{item.category}</span>
                <span className="text-[11px] font-mono text-slate-500">{item.type}</span>
              </div>
              <p className="font-medium text-white mb-2">{item.name}</p>
              <div className="flex items-center gap-3 text-sm text-slate-400 mb-4">
                <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {item.downloads}</span>
                <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-400" /> {item.rating}</span>
              </div>
              <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10">
                <Download className="h-3.5 w-3.5" />
                Install
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Categories</p>
            <h3 className="text-lg font-semibold text-white">Browse by type</h3>
          </div>
          <Store className="h-5 w-5 text-accent" />
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            { icon: BookOpen, label: 'Templates', count: 12 },
            { icon: Cpu, label: 'Training packs', count: 8 },
            { icon: Database, label: 'Data connectors', count: 15 },
            { icon: Wand2, label: 'Feature tools', count: 10 },
          ].map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center hover:bg-white/10 transition-colors cursor-pointer">
                <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-white">{cat.label}</p>
                <p className="text-xs text-slate-500 mt-1">{cat.count} items</p>
              </div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}

export default MarketplacePage;
