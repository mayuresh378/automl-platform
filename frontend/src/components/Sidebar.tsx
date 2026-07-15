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
  Plug,
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
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../lib/cn';
import { useUIStore } from '../store/useUIStore';
import { staggerContainer, staggerItem, spring } from '../lib/animations';

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

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 76 : 248 }}
      transition={{ duration: 0.22, ease: 'easeInOut' }}
      className="hidden md:flex flex-col shrink-0 h-screen sticky top-0 border-r border-border bg-surface/60 backdrop-blur-sm"
    >
      <div className={cn('flex items-center h-16 px-4 gap-2.5 border-b border-border', sidebarCollapsed && 'justify-center px-0')}>
        <motion.button
          onClick={handleLogoClick}
          className="btn-press flex items-center gap-2.5"
        >
          <motion.div
            className="logo-container relative flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-primary via-secondary to-accent shrink-0"
            animate={logoBlink ? { scale: [1, 1.3, 1], opacity: [1, 0.6, 1] } : {}}
            transition={{ duration: 0.2 }}
            whileTap={{ scale: 0.8 }}
          >
            <Zap className="logo-icon h-4 w-4 text-white" strokeWidth={2.5} />
          </motion.div>
          {!sidebarCollapsed && (
            <span className="font-semibold text-[15px] tracking-tight text-white whitespace-nowrap">
              AutoML Studio
            </span>
          )}
        </motion.button>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2.5 space-y-4">
        {groups.map((group) => (
          <motion.div
            key={group}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="px-2 mb-1 text-[10px] font-semibold tracking-wider uppercase text-zinc-600"
              >
                {group}
              </motion.div>
            )}
            <div className="space-y-0.5">
              {NAV_ITEMS.filter((n) => n.group === group).map((item, i) => {
                const isActive = activePage === item.label;
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.25, ease: 'easeOut' }}
                    onClick={() => handleNavClick(item.label)}
                    title={sidebarCollapsed ? item.label : undefined}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.97 }}
                    className={cn(
                      'group relative w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors cursor-pointer select-none',
                      sidebarCollapsed && 'justify-center px-0',
                      isActive
                        ? 'text-white bg-white/[0.06]'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active-indicator"
                        className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-gradient-to-b from-primary to-accent"
                        transition={spring}
                      />
                    )}
                    <motion.span
                      whileHover={{ scale: 1.15 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0 inline-flex"
                    >
                      <Icon className={cn('h-[16px] w-[16px]', isActive ? 'text-primary' : 'text-zinc-500 group-hover:text-zinc-300')} strokeWidth={2} />
                    </motion.span>
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </nav>

      <div className="border-t border-border p-2.5 space-y-0.5">
        {FOOTER_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.label}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleFooterClick(item.label)}
              title={sidebarCollapsed ? item.label : undefined}
              className={cn(
                'group w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors cursor-pointer select-none',
                sidebarCollapsed && 'justify-center px-0',
                activePage === (item.label === 'Settings' || item.label === 'Billing' || item.label === 'Admin' ? 'Settings' : item.label)
                  ? 'text-white bg-white/[0.06]'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
              )}
            >
              <motion.span whileHover={{ scale: 1.15 }} transition={{ duration: 0.2 }}>
                <Icon className={cn('h-[16px] w-[16px] shrink-0', activePage === (item.label === 'Settings' || item.label === 'Billing' || item.label === 'Admin' ? 'Settings' : item.label) ? 'text-primary' : 'text-zinc-500 group-hover:text-zinc-300')} strokeWidth={2} />
              </motion.span>
              {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
            </motion.button>
          );
        })}

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleSidebar}
          className={cn(
            'group w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors mt-1 cursor-pointer select-none',
            sidebarCollapsed && 'justify-center px-0'
          )}
        >
          <motion.span
            animate={sidebarCollapsed ? { rotate: 180 } : { rotate: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
          >
            {sidebarCollapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </motion.span>
          {!sidebarCollapsed && <span>Collapse</span>}
        </motion.button>
      </div>
    </motion.aside>
  );
});
export { Sidebar };
