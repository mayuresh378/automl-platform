import { useState, useMemo, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History, Clock, Star, Pin, Search, Trash2, Copy, RotateCcw, ChevronDown, MoreHorizontal,
  X, Heart, Bookmark,
} from 'lucide-react';
import { cn } from '../../../lib/cn';
import { sqlService } from '../services/sqlEditor.service';
import { QueryHistoryItem } from '../types';

interface QueryHistoryProps {
  onRestoreQuery: (query: string) => void;
  onClose: () => void;
}

export const QueryHistory = memo(function QueryHistory({ onRestoreQuery, onClose }: QueryHistoryProps) {
  const [history, setHistory] = useState<QueryHistoryItem[]>(() => sqlService.getHistory());
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'today' | 'yesterday' | 'favorites'>('all');

  const filtered = useMemo(() => {
    const now = Date.now();
    const day = 86400000;
    return history.filter((h) => {
      if (filter === 'today' && now - h.executedAt > day) return false;
      if (filter === 'yesterday' && (now - h.executedAt > 2 * day || now - h.executedAt < day)) return false;
      if (filter === 'favorites' && !h.favorite) return false;
      if (search && !h.query.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [history, filter, search]);

  const toggleFavorite = useCallback((id: string) => {
    const item = history.find((h) => h.id === id);
    if (item) {
      sqlService.updateHistory(id, { favorite: !item.favorite });
      setHistory((prev) => prev.map((h) => h.id === id ? { ...h, favorite: !h.favorite } : h));
    }
  }, [history]);

  const deleteItem = useCallback((id: string) => {
    sqlService.deleteHistory(id);
    setHistory((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    sqlService.clearHistory();
    setHistory([]);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-[600px] max-h-[70vh] rounded-lg border border-border bg-card shadow-dropdown overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-zinc-200">Query History</span>
            <span className="text-[11px] text-zinc-500">({history.length})</span>
          </div>
          <div className="flex items-center gap-2">
            {['all', 'today', 'yesterday', 'favorites'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={cn(
                  'px-2 py-1 rounded text-[11px] capitalize transition-colors',
                  filter === f ? 'bg-primary/20 text-primary' : 'text-zinc-500 hover:text-zinc-300 hover:bg-sidebar-hover',
                )}
              >
                {f === 'favorites' ? '⭐' : f}
              </button>
            ))}
            <div className="w-px h-4 bg-border mx-1" />
            <button onClick={clearAll} className="text-[11px] text-zinc-500 hover:text-danger transition-colors">Clear</button>
            <button onClick={onClose} className="p-1 rounded hover:bg-sidebar-hover text-zinc-500">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-4 py-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search queries..."
              className="w-full h-8 pl-8 pr-3 rounded-md bg-white/[0.05] border border-border text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>

        <div className="overflow-y-auto max-h-[50vh] scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">No queries found</div>
          ) : (
            <div className="divide-y divide-border/50">
              {filtered.map((item) => (
                <div key={item.id} className="px-4 py-2.5 hover:bg-sidebar-hover transition-colors group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <pre className="text-xs font-mono text-zinc-300 truncate">{item.query}</pre>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-zinc-500">
                          {new Date(item.executedAt).toLocaleString()}
                        </span>
                        {item.executionTime && (
                          <span className="text-[10px] text-zinc-600">{item.executionTime}ms</span>
                        )}
                        {item.rowsReturned != null && (
                          <span className="text-[10px] text-zinc-600">{item.rowsReturned} rows</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => toggleFavorite(item.id)} className="p-1 rounded hover:bg-white/[0.05]">
                        <Heart className={cn('w-3.5 h-3.5', item.favorite ? 'text-red-400 fill-red-400' : 'text-zinc-500')} />
                      </button>
                      <button onClick={() => { onRestoreQuery(item.query); }} className="p-1 rounded hover:bg-white/[0.05] text-zinc-500 hover:text-zinc-300">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteItem(item.id)} className="p-1 rounded hover:bg-white/[0.05] text-zinc-500 hover:text-danger">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
});
