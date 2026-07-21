import { useState, useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Sparkles, User, X, Clock, AlertCircle, CheckCircle2, Info, AlertTriangle, Moon, Sun } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '../store/useUIStore';
import { useNotificationStore, useUnreadCount, useNotificationActions, Notification } from '../store/useNotificationStore';
import { cn } from '../lib/cn';

const NOTIF_ICONS: Record<Notification['type'], any> = { success: CheckCircle2, info: Info, warning: AlertTriangle, error: AlertCircle };
const NOTIF_COLORS: Record<Notification['type'], string> = { success: 'text-success', info: 'text-primary', warning: 'text-warning', error: 'text-danger' };

function formatTimeAgo(ts: number) {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

const TopNav = memo(function TopNav() {
  const { setCommandPaletteOpen, setActivePage, setSettingsTab, theme, toggleTheme } = useUIStore();
  const { notifications } = useNotificationStore(useShallow((s) => ({ notifications: s.notifications })));
  const unreadCount = useUnreadCount();
  const { markRead, markAllRead, dismiss, clearAll } = useNotificationActions();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = '?';

  return (
    <header className="sticky top-0 z-30 flex items-center h-14 gap-3 border-b border-border bg-canvas/90 backdrop-blur-md px-4 md:px-6">
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setCommandPaletteOpen(true)}
        className="flex-1 max-w-md hidden sm:flex items-center gap-2.5 rounded-lg border border-border bg-card/50 px-3 py-1.5 text-sm text-zinc-500 hover:border-primary/30 hover:text-zinc-400 transition-colors cursor-pointer select-none"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-border text-zinc-600">⌘K</kbd>
      </motion.button>

      <div className="ml-auto flex items-center gap-1">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="btn-press sm:hidden p-2 rounded-lg text-zinc-400 hover:bg-sidebar-hover"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white cursor-pointer select-none"
          onClick={() => setActivePage('AI Assistant')}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Ask AI</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={toggleTheme}
          className="relative p-2 rounded-lg text-zinc-400 hover:bg-sidebar-hover transition-colors cursor-pointer select-none"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </motion.button>

        <div className="relative" ref={notifRef}>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setNotifOpen((o) => !o)}
            className="relative p-2 rounded-lg text-zinc-400 hover:bg-sidebar-hover transition-colors cursor-pointer select-none"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[14px] flex items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white px-[3px]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </motion.button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 mt-1 w-80 rounded-lg border border-border bg-card shadow-dropdown p-1 text-sm max-h-96 flex flex-col origin-top-right"
              >
                <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                  <span className="text-xs font-medium text-zinc-300">Notifications</span>
                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-[10px] text-primary hover:text-primary/80 transition-colors px-1.5 py-0.5">Mark all read</button>
                    )}
                    <button onClick={clearAll} className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors px-1.5 py-0.5">Clear</button>
                  </div>
                </div>
                <div className="overflow-y-auto flex-1">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-zinc-500">No notifications</div>
                  ) : (
                    <div className="space-y-0.5 py-1">
                      {notifications.map((n) => {
                        const Icon = NOTIF_ICONS[n.type];
                        return (
                          <div key={n.id} className={cn(
                            'flex items-start gap-2.5 px-3 py-2.5 rounded mx-1 transition-colors',
                            n.read ? 'hover:bg-sidebar-hover' : 'bg-primary/[0.04] hover:bg-primary/[0.06]',
                          )}>
                            <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', NOTIF_COLORS[n.type])} />
                            <div className="flex-1 min-w-0" onClick={() => markRead(n.id)}>
                              <p className={cn('text-xs', n.read ? 'text-zinc-400' : 'text-zinc-200 font-medium')}>{n.title}</p>
                              {n.message && <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">{n.message}</p>}
                              <p className="text-[10px] text-zinc-600 mt-1">{formatTimeAgo(n.timestamp)}</p>
                            </div>
                            <button onClick={() => dismiss(n.id)} className="shrink-0 text-zinc-600 hover:text-zinc-400 transition-colors mt-0.5">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center justify-center h-7 w-7 rounded-full text-[10px] font-semibold ml-1 cursor-pointer select-none bg-white/10 text-zinc-400"
          >
            <User className="h-3.5 w-3.5" />
          </motion.button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 mt-1 w-52 rounded-lg border border-border bg-card shadow-dropdown p-1 text-sm origin-top-right"
              >
                <>
                  <div className="px-2.5 py-1.5 text-zinc-300 font-medium">Guest</div>
                  <div className="my-1 border-t border-border" />
                  <div className="px-2.5 py-1.5 text-zinc-400 rounded hover:bg-sidebar-hover cursor-pointer" onClick={() => setActivePage('Settings')}>Settings</div>
                </>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
});
export { TopNav };
