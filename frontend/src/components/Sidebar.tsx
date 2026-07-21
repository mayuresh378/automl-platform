import { useState, memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, FolderKanban, Database, SprayCan, Wand2, TerminalSquare, Cpu, FlaskConical, Boxes,
  Rocket, Activity, Workflow, Zap, Bot, Store, Settings, LifeBuoy, BookOpen, CreditCard, Shield,
  ChevronsLeft, ChevronsRight, BrainCircuit, GitCompare, BarChart3, SlidersHorizontal, Bell, Plug, Search, Sparkles, User,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../lib/cn';
import { useUIStore } from '../store/useUIStore';

interface NavItem { label: string; icon: LucideIcon; group: string; }

const NAV_ITEMS: NavItem[] = [
  { label: 'Search', icon: Search, group: 'Main Menu' },
  { label: 'Dashboard', icon: LayoutDashboard, group: 'Main Menu' },
  { label: 'Projects', icon: FolderKanban, group: 'Main Menu' },
  { label: 'Datasets', icon: Database, group: 'Data' },
  { label: 'Data Cleaning', icon: SprayCan, group: 'Data' },
  { label: 'Feature Engineering', icon: Wand2, group: 'Data' },
  { label: 'SQL Editor', icon: TerminalSquare, group: 'Data' },
  { label: 'Models', icon: Boxes, group: 'Model' },
  { label: 'Training', icon: FlaskConical, group: 'Model' },
  { label: 'HPO Tuning', icon: SlidersHorizontal, group: 'Model' },
  { label: 'Model Comparison', icon: GitCompare, group: 'Model' },
  { label: 'Explainable AI', icon: BrainCircuit, group: 'Model' },
  { label: 'Deployment', icon: Rocket, group: 'Serve' },
  { label: 'Inference API', icon: Plug, group: 'Serve' },
  { label: 'Activity', icon: Activity, group: 'Serve' },
  { label: 'Monitoring', icon: BarChart3, group: 'Serve' },
  { label: 'Pipelines', icon: Workflow, group: 'Automation' },
  { label: 'Automations', icon: Zap, group: 'Automation' },
  { label: 'AI Assistant', icon: Bot, group: 'Automation' },
  { label: 'Marketplace', icon: Store, group: 'Automation' },
];

const FOOTER_ITEMS: NavItem[] = [
  { label: 'Settings', icon: Settings, group: '' },
  { label: 'Support', icon: LifeBuoy, group: '' },
  { label: 'Documentation', icon: BookOpen, group: '' },
];

const Sidebar = memo(function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, activePage, setActivePage, setSettingsTab } = useUIStore();
  const initials = '?';

  const groups = Array.from(new Set(NAV_ITEMS.map((n) => n.group)));

  const handleNavClick = useCallback((label: string) => setActivePage(label), [setActivePage]);

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="hidden md:flex flex-col shrink-0 h-screen sticky top-0 bg-sidebar border-r border-border z-[100]"
    >
      <div className={cn('flex items-center h-14 px-4 gap-2', sidebarCollapsed && 'justify-center px-0')}>
        <div className={cn('flex items-center gap-2.5', !sidebarCollapsed && 'px-1')}>
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary shrink-0">
            <Sparkles className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
          {!sidebarCollapsed && (
            <span className="font-semibold text-base tracking-tight text-white whitespace-nowrap">
              AutoML
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin py-2 px-2 space-y-4">
        {groups.map((group) => (
          <div key={group}>
            {!sidebarCollapsed && (
              <div className="px-3 mb-1 text-[11px] font-semibold tracking-wider uppercase text-zinc-500">
                {group}
              </div>
            )}
            <div className="space-y-0.5">
              {NAV_ITEMS.filter((n) => n.group === group).map((item) => {
                const isActive = activePage === item.label;
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.label}
                    onClick={() => handleNavClick(item.label)}
                    title={sidebarCollapsed ? item.label : undefined}
                    whileTap={{ scale: 0.97 }}
                    className={cn(
                      'group relative w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 cursor-pointer select-none',
                      sidebarCollapsed && 'justify-center px-0',
                      isActive
                        ? 'bg-primary/15 text-primary'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-sidebar-hover',
                    )}
                  >
                    {isActive && !sidebarCollapsed && (
                      <motion.div layoutId="sidebar-active" className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r bg-primary" />
                    )}
                    <Icon className={cn('h-[18px] w-[18px] shrink-0', isActive ? 'text-primary' : 'text-zinc-500 group-hover:text-zinc-300')} strokeWidth={1.5} />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border px-2 py-2 space-y-0.5">
        {FOOTER_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.label}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleNavClick(item.label)}
              title={sidebarCollapsed ? item.label : undefined}
              className={cn(
                'group w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 cursor-pointer select-none',
                sidebarCollapsed && 'justify-center px-0',
                'text-zinc-400 hover:text-zinc-200 hover:bg-sidebar-hover',
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0 text-zinc-500 group-hover:text-zinc-300" strokeWidth={1.5} />
              {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
            </motion.button>
          );
        })}

        <div className={cn('pt-2 mt-1 border-t border-border', sidebarCollapsed && 'flex justify-center')}>
          <div className={cn(
            'flex items-center gap-2.5 px-2 py-2 rounded-lg',
            !sidebarCollapsed && 'hover:bg-sidebar-hover cursor-pointer'
          )}>
            <div className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/20 text-primary text-[10px] font-semibold shrink-0">
              <User className="h-3.5 w-3.5" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-zinc-300 truncate">Guest</p>
              </div>
            )}
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleSidebar}
          className={cn(
            'group w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-500 hover:text-zinc-300 hover:bg-sidebar-hover transition-colors cursor-pointer select-none',
            sidebarCollapsed && 'justify-center px-0'
          )}
        >
          <motion.span
            animate={sidebarCollapsed ? { rotate: 180 } : { rotate: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
          >
            {sidebarCollapsed ? <ChevronsRight className="h-[18px] w-[18px]" /> : <ChevronsLeft className="h-[18px] w-[18px]" />}
          </motion.span>
          {!sidebarCollapsed && <span>Collapse</span>}
        </motion.button>
      </div>
    </motion.aside>
  );
});
export { Sidebar };
