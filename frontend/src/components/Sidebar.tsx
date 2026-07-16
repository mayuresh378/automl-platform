import { useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  Database,
  SprayCan,
  Wand2,
  TerminalSquare,
  Cpu,
  FlaskConical,
  Boxes,
  Rocket,
  Activity,
  Workflow,
  Zap,
  Bot,
  Store,
  Settings,
  LifeBuoy,
  BookOpen,
  CreditCard,
  ShieldCheck,
  ChevronsLeft,
  ChevronsRight,
  BrainCircuit,
  GitCompare,
  BarChart3,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Search,
  Bell,
  Plug,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../lib/cn';
import { useUIStore } from '../store/useUIStore';

interface NavItem {
  label: string;
  icon: LucideIcon;
  group: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Search', icon: Search, group: 'Workspace' },
  { label: 'Dashboard', icon: LayoutDashboard, group: 'Workspace' },
  { label: 'Projects', icon: FolderKanban, group: 'Workspace' },
  { label: 'Datasets', icon: Database, group: 'Data' },
  { label: 'Data Cleaning', icon: SprayCan, group: 'Data' },
  { label: 'Feature Engineering', icon: Wand2, group: 'Data' },
  { label: 'Dataset Analysis', icon: BrainCircuit, group: 'Data' },
  { label: 'SQL Editor', icon: TerminalSquare, group: 'Data' },
  { label: 'AutoML Engine', icon: Cpu, group: 'Model' },
  { label: 'Training', icon: FlaskConical, group: 'Model' },
  { label: 'HPO Tuning', icon: SlidersHorizontal, group: 'Model' },
  { label: 'Experiments', icon: FlaskConical, group: 'Model' },
  { label: 'Model Comparison', icon: GitCompare, group: 'Model' },
  { label: 'Explainable AI', icon: BrainCircuit, group: 'Model' },
  { label: 'Models', icon: Boxes, group: 'Model' },
  { label: 'Deployment', icon: Rocket, group: 'Serve' },
  { label: 'Inference API', icon: Plug, group: 'Serve' },
  { label: 'Activity', icon: Activity, group: 'Serve' },
  { label: 'Notifications', icon: Bell, group: 'Serve' },
  { label: 'Analytics', icon: BarChart3, group: 'Serve' },
  { label: 'Monitoring', icon: Activity, group: 'Serve' },
  { label: 'Pipelines', icon: Workflow, group: 'Automate' },
  { label: 'Automations', icon: Zap, group: 'Automate' },
  { label: 'AI Assistant', icon: Bot, group: 'Automate' },
  { label: 'Marketplace', icon: Store, group: 'Automate' },
];

const FOOTER_ITEMS: NavItem[] = [
  { label: 'Settings', icon: Settings, group: 'System' },
  { label: 'Billing', icon: CreditCard, group: 'System' },
  { label: 'Admin', icon: Shield, group: 'System' },
  { label: 'Documentation', icon: BookOpen, group: 'System' },
  { label: 'Support', icon: LifeBuoy, group: 'System' },
];

const Sidebar = memo(function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, activePage, setActivePage, setSettingsTab } = useUIStore();
  const [logoBlink, setLogoBlink] = useState(false);

  const groups = Array.from(new Set(NAV_ITEMS.map((n) => n.group)));

  const handleLogoClick = useCallback(() => { setActivePage('Dashboard'); setLogoBlink(true); setTimeout(() => setLogoBlink(false), 150); }, [setActivePage]);

  const handleNavClick = useCallback((label: string) => { setActivePage(label); }, [setActivePage]);

  const handleFooterClick = useCallback((label: string) => {
    if (label === 'Settings') { setSettingsTab('account'); setActivePage('Settings'); }
    else if (label === 'Billing') { setSettingsTab('account'); setActivePage('Settings'); }
    else if (label === 'Admin') { setActivePage('Admin'); }
    else { setActivePage(label); }
  }, [setActivePage, setSettingsTab]);

  const navLinkClass = (isActive: boolean, collapsed: boolean) => cn(
    'group relative w-full flex items-center gap-2.5 rounded px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer select-none',
    collapsed && 'justify-center px-0',
    isActive
      ? 'text-white bg-primary shadow-nav-active'
      : 'text-zinc-400 hover:text-white hover:bg-white/[0.08]',
  );

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 76 : 260 }}
      transition={{ duration: 0.4, ease: 'ease' }}
      className="hidden md:flex flex-col shrink-0 h-screen sticky top-0 bg-card border-r border-border shadow-sidebar z-[1000]"
    >
      <div className={cn('flex items-center h-16 px-4 gap-2.5 border-b border-border', sidebarCollapsed && 'justify-center px-0')}>
        <motion.button onClick={handleLogoClick} className="flex items-center gap-2.5 cursor-pointer select-none">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary shrink-0">
            <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          {!sidebarCollapsed && (
            <span className="font-semibold text-base tracking-tight text-white whitespace-nowrap">
              <span className="text-primary">Auto</span>ML
            </span>
          )}
        </motion.button>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin py-2 px-3 space-y-1">
        {groups.map((group) => (
          <div key={group} className="mb-2">
            {!sidebarCollapsed && (
              <div className="px-3 mb-1 text-[10px] font-semibold tracking-wider uppercase text-zinc-500">
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
                    className={navLinkClass(isActive, sidebarCollapsed)}
                  >
                    <Icon className={cn('h-[18px] w-[18px] shrink-0', isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300')} strokeWidth={1.5} />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border px-3 py-2 space-y-0.5">
        {FOOTER_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.label}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleFooterClick(item.label)}
              title={sidebarCollapsed ? item.label : undefined}
              className={navLinkClass(
                activePage === (item.label === 'Settings' || item.label === 'Billing' || item.label === 'Admin' ? 'Settings' : item.label),
                sidebarCollapsed,
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0 text-zinc-500 group-hover:text-zinc-300" strokeWidth={1.5} />
              {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
            </motion.button>
          );
        })}

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleSidebar}
          className={cn(
            'group w-full flex items-center gap-2.5 rounded px-3 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05] transition-colors mt-1 cursor-pointer select-none',
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
