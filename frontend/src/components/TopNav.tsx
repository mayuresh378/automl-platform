import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Sparkles, ChevronDown, KeyRound, LogIn, Check, X, Clock, AlertCircle, CheckCircle2, Info, AlertTriangle, Moon, Sun, Folders, Plus } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';
import { useAuthStore } from '../store/useAuthStore';
import { useProjects } from '../hooks/useApi';
import { useNotificationStore, Notification } from '../store/useNotificationStore';
import { cn } from '../lib/cn';

const NOTIF_ICONS: Record<Notification['type'], any> = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
};
const NOTIF_COLORS: Record<Notification['type'], string> = {
  success: 'text-emerald-400',
  info: 'text-blue-400',
  warning: 'text-amber-400',
  error: 'text-danger',
};

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

export function TopNav() {
  const { setCommandPaletteOpen, setActivePage, setCurrentProjectId, setSettingsTab, theme, toggleTheme } = useUIStore();
  const { user, logout } = useAuthStore();
  const { notifications, add, markRead, markAllRead, dismiss, clearAll, unreadCount } = useNotificationStore();
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
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
  const isLoggedIn = !!user && !!user.id && user.id !== 'anonymous';
  const initials = isLoggedIn ? user!.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : '?';
  const { data: projects = [] } = useProjects();

  return (
    <header className="sticky top-0 z-30 flex items-center h-16 gap-3 border-b border-border bg-canvas/80 backdrop-blur-md px-4 md:px-6">
      <div className="relative">
        <motion.button
          onClick={() => setWorkspaceOpen((o) => !o)}
          onBlur={() => setTimeout(() => setWorkspaceOpen(false), 120)}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-zinc-200 hover:bg-white/[0.05] transition-colors cursor-pointer select-none"
        >
          <span className="h-5 w-5 rounded-md bg-gradient-to-br from-primary to-secondary" />
          {isLoggedIn ? `${user!.name}'s Workspace` : 'My Workspace'}
          <motion.span
            animate={{ rotate: workspaceOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="inline-flex"
          >
            <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
          </motion.span>
        </motion.button>
        <AnimatePresence>
          {workspaceOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute left-0 mt-1 w-64 rounded-xl border border-border-strong bg-card shadow-glow p-1 text-sm origin-top-left"
            >
              <div className="px-2.5 py-1.5 text-zinc-200 rounded-lg bg-white/[0.05] flex items-center gap-2">
                <Folders className="h-3.5 w-3.5 text-zinc-400" />
                Projects
              </div>
              <div className="max-h-48 overflow-y-auto scrollbar-thin">
                {projects.slice(0, 8).map((p: any) => (
                  <div
                    key={p.id}
                    onClick={() => { setCurrentProjectId(p.id); setActivePage('Project Detail'); setWorkspaceOpen(false); }}
                    className="px-2.5 py-1.5 text-zinc-400 rounded-lg hover:bg-white/[0.04] cursor-pointer truncate"
                  >
                    {p.name}
                  </div>
                ))}
                {projects.length === 0 && (
                  <div className="px-2.5 py-1.5 text-zinc-600 text-xs">No projects yet</div>
                )}
              </div>
              <div className="my-1 border-t border-border" />
              <div
                onClick={() => { setActivePage('Projects'); setWorkspaceOpen(false); }}
                className="px-2.5 py-1.5 text-primary rounded-lg hover:bg-white/[0.04] cursor-pointer flex items-center gap-2"
              >
                <Plus className="h-3.5 w-3.5" /> New project
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setCommandPaletteOpen(true)}
        className="flex-1 max-w-md hidden sm:flex items-center gap-2.5 rounded-lg border border-border bg-surface/60 px-3 py-1.5 text-sm text-zinc-500 hover:border-primary/30 hover:text-zinc-400 transition-colors cursor-pointer select-none"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Search everything…</span>
        <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-border-strong text-zinc-500">
          ⌘K
        </kbd>
      </motion.button>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="btn-press sm:hidden p-2 rounded-lg text-zinc-400 hover:bg-white/[0.05]"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>

        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-secondary px-3 py-1.5 text-sm font-medium text-white shadow-glow-sm cursor-pointer select-none"
          onClick={() => setActivePage('AI Assistant')}
        >
          <motion.span
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-flex"
          >
            <Sparkles className="h-3.5 w-3.5" />
          </motion.span>
          <span className="hidden sm:inline">Ask AI</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={toggleTheme}
          className="relative p-2 rounded-lg text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200 transition-colors cursor-pointer select-none"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </motion.button>

        <div className="relative" ref={notifRef}>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setNotifOpen((o) => !o)}
            className="relative p-2 rounded-lg text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200 transition-colors cursor-pointer select-none"
            aria-label="Notifications"
          >
            <motion.span
              animate={unreadCount() > 0 ? { rotate: [0, 10, -10, 0] } : {}}
              transition={{ duration: 0.5 }}
              className="inline-flex"
            >
              <Bell className="h-4 w-4" />
            </motion.span>
            {unreadCount() > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 h-4 min-w-[14px] flex items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white px-[3px]"
              >
                {unreadCount() > 9 ? '9+' : unreadCount()}
              </motion.span>
            )}
          </motion.button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 mt-1 w-80 rounded-xl border border-border-strong bg-card shadow-glow p-1 text-sm max-h-96 flex flex-col origin-top-right"
              >
              <div className="flex items-center justify-between px-2.5 py-2 border-b border-border">
                <span className="text-xs font-medium text-zinc-300">Notifications</span>
                <div className="flex items-center gap-1">
                  {unreadCount() > 0 && (
                    <button onClick={markAllRead} className="btn-press text-[10px] text-primary hover:text-primary/80 transition-colors px-1.5 py-0.5">Mark all read</button>
                  )}
                  <button onClick={clearAll} className="btn-press text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors px-1.5 py-0.5">Clear</button>
                </div>
              </div>
              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-500">No notifications yet</div>
                ) : (
                  <div className="space-y-0.5 py-1">
                    {notifications.map((n) => {
                      const Icon = NOTIF_ICONS[n.type];
                      return (
                        <div key={n.id} className={cn(
                          'flex items-start gap-2.5 px-3 py-2.5 rounded-lg mx-1 transition-colors',
                          n.read ? 'hover:bg-white/[0.03]' : 'bg-primary/[0.04] hover:bg-primary/[0.06]',
                        )}>
                          <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', NOTIF_COLORS[n.type])} />
                          <div className="flex-1 min-w-0" onClick={() => { markRead(n.id); }}>
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
            onBlur={() => setTimeout(() => setProfileOpen(false), 120)}
            className={cn(
              'flex items-center justify-center h-8 w-8 rounded-full text-xs font-semibold text-white ml-1 cursor-pointer select-none',
              isLoggedIn
                ? 'bg-gradient-to-br from-accent to-secondary'
                : 'bg-white/10 border border-white/20',
              profileOpen && 'ring-2 ring-primary/50'
            )}
          >
            {isLoggedIn ? initials : <LogIn className="h-4 w-4" />}
          </motion.button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 mt-1 w-52 rounded-xl border border-border-strong bg-card shadow-glow p-1 text-sm origin-top-right"
              >
                {isLoggedIn ? (
                  <>
                    <div className="px-2.5 py-2">
                      <div className="text-zinc-200 font-medium">{user!.name}</div>
                      <div className="text-zinc-500 text-xs">{user!.email}</div>
                    </div>
                    <div className="my-1 border-t border-border" />
                    <div className="px-2.5 py-1.5 text-zinc-400 rounded-lg hover:bg-white/[0.04] cursor-pointer" onClick={() => setActivePage('Settings')}>Profile settings</div>
                <div className="px-2.5 py-1.5 text-zinc-400 rounded-lg hover:bg-white/[0.04] cursor-pointer flex items-center gap-2" onClick={() => { setSettingsTab('authentication'); setActivePage('Settings'); setProfileOpen(false); }}>
                  <KeyRound className="h-3.5 w-3.5 text-accent" /> Authentication
                </div>
                <div className="px-2.5 py-1.5 text-zinc-400 rounded-lg hover:bg-white/[0.04] cursor-pointer" onClick={() => { setSettingsTab('billing'); setActivePage('Settings'); }}>Billing</div>
                    <div className="px-2.5 py-1.5 text-danger rounded-lg hover:bg-white/[0.04] cursor-pointer" onClick={() => { logout(); setProfileOpen(false); }}>Sign out</div>
                  </>
                ) : (
                  <>
                    <div className="px-2.5 py-1.5 text-zinc-300 font-medium">Guest</div>
                    <div className="my-1 border-t border-border" />
                    <div className="px-2.5 py-1.5 text-primary rounded-lg hover:bg-white/[0.04] cursor-pointer flex items-center gap-2" onClick={() => { setSettingsTab('authentication'); setActivePage('Settings'); setProfileOpen(false); }}>
                      <LogIn className="h-3.5 w-3.5" /> Sign in
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
