import { useState } from 'react';
import { Search, Bell, Sparkles, ChevronDown } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';
import { cn } from '../lib/cn';

export function TopNav() {
  const { setCommandPaletteOpen, setActivePage } = useUIStore();
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center h-16 gap-3 border-b border-border bg-canvas/80 backdrop-blur-md px-4 md:px-6">
      <div className="relative">
        <button
          onClick={() => setWorkspaceOpen((o) => !o)}
          onBlur={() => setTimeout(() => setWorkspaceOpen(false), 120)}
          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-zinc-200 hover:bg-white/[0.05] transition-colors"
        >
          <span className="h-5 w-5 rounded-md bg-gradient-to-br from-primary to-secondary" />
          Mayuresh's Workspace
          <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
        </button>
        {workspaceOpen && (
          <div className="absolute left-0 mt-1 w-56 rounded-xl border border-border-strong bg-card shadow-glow p-1 text-sm">
            <div className="px-2.5 py-1.5 text-zinc-200 rounded-lg bg-white/[0.05]">Mayuresh's Workspace</div>
            <div className="px-2.5 py-1.5 text-zinc-500 rounded-lg hover:bg-white/[0.04] cursor-pointer">Personal Sandbox</div>
            <div className="my-1 border-t border-border" />
            <div className="px-2.5 py-1.5 text-primary rounded-lg hover:bg-white/[0.04] cursor-pointer">+ New workspace</div>
          </div>
        )}
      </div>

      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="flex-1 max-w-md hidden sm:flex items-center gap-2.5 rounded-lg border border-border bg-surface/60 px-3 py-1.5 text-sm text-zinc-500 hover:border-border-strong hover:text-zinc-400 transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Search everything…</span>
        <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-border-strong text-zinc-500">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="sm:hidden p-2 rounded-lg text-zinc-400 hover:bg-white/[0.05]"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>

        <button className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-secondary px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 transition-opacity shadow-glow-sm"
          onClick={() => setActivePage('AI Assistant')}>
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>

        <button className="relative p-2 rounded-lg text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200 transition-colors" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-danger" />
        </button>

        <div className="relative">
          <button
            onClick={() => setProfileOpen((o) => !o)}
            onBlur={() => setTimeout(() => setProfileOpen(false), 120)}
            className={cn(
              'flex items-center justify-center h-8 w-8 rounded-full text-xs font-semibold text-white bg-gradient-to-br from-accent to-secondary ml-1',
              profileOpen && 'ring-2 ring-primary/50'
            )}
          >
            MJ
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-1 w-52 rounded-xl border border-border-strong bg-card shadow-glow p-1 text-sm">
              <div className="px-2.5 py-2">
                <div className="text-zinc-200 font-medium">Mayuresh</div>
                <div className="text-zinc-500 text-xs">Free plan</div>
              </div>
              <div className="my-1 border-t border-border" />
              <div className="px-2.5 py-1.5 text-zinc-400 rounded-lg hover:bg-white/[0.04] cursor-pointer" onClick={() => setActivePage('Settings')}>Profile settings</div>
              <div className="px-2.5 py-1.5 text-zinc-400 rounded-lg hover:bg-white/[0.04] cursor-pointer" onClick={() => setActivePage('Settings')}>Billing</div>
              <div className="px-2.5 py-1.5 text-danger rounded-lg hover:bg-white/[0.04] cursor-pointer">Sign out</div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
