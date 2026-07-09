import { motion } from 'framer-motion';
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
  { label: 'Dashboard', icon: LayoutDashboard, group: 'Workspace' },
  { label: 'Projects', icon: FolderKanban, group: 'Workspace' },
  { label: 'Datasets', icon: Database, group: 'Data' },
  { label: 'Data Cleaning', icon: SprayCan, group: 'Data' },
  { label: 'Feature Engineering', icon: Wand2, group: 'Data' },
  { label: 'SQL Editor', icon: TerminalSquare, group: 'Data' },
  { label: 'Training', icon: Cpu, group: 'Model' },
  { label: 'Experiments', icon: FlaskConical, group: 'Model' },
  { label: 'Models', icon: Boxes, group: 'Model' },
  { label: 'Deployment', icon: Rocket, group: 'Serve' },
  { label: 'Inference API', icon: Plug, group: 'Serve' },
  { label: 'Monitoring', icon: Activity, group: 'Serve' },
  { label: 'Pipelines', icon: Workflow, group: 'Automate' },
  { label: 'Automations', icon: Zap, group: 'Automate' },
  { label: 'AI Assistant', icon: Bot, group: 'Automate' },
  { label: 'Marketplace', icon: Store, group: 'Automate' },
];

const FOOTER_ITEMS: NavItem[] = [
  { label: 'Settings', icon: Settings, group: 'System' },
  { label: 'Billing', icon: CreditCard, group: 'System' },
  { label: 'Admin', icon: ShieldCheck, group: 'System' },
  { label: 'Documentation', icon: BookOpen, group: 'System' },
  { label: 'Support', icon: LifeBuoy, group: 'System' },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, activePage, setActivePage } = useUIStore();

  const groups = Array.from(new Set(NAV_ITEMS.map((n) => n.group)));

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 76 : 248 }}
      transition={{ duration: 0.22, ease: 'easeInOut' }}
      className="hidden md:flex flex-col shrink-0 h-screen sticky top-0 border-r border-border bg-surface/60 backdrop-blur-sm"
    >
      <div className={cn('flex items-center h-16 px-4 gap-2.5 border-b border-border', sidebarCollapsed && 'justify-center px-0')}>
        <div className="relative flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-primary via-secondary to-accent shrink-0">
          <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        {!sidebarCollapsed && (
          <span className="font-semibold text-[15px] tracking-tight text-white whitespace-nowrap">
            AutoML Studio
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2.5 space-y-4">
        {groups.map((group) => (
          <div key={group}>
            {!sidebarCollapsed && (
              <div className="px-2 mb-1 text-[10px] font-semibold tracking-wider uppercase text-zinc-600">
                {group}
              </div>
            )}
            <div className="space-y-0.5">
              {NAV_ITEMS.filter((n) => n.group === group).map((item) => {
                const isActive = activePage === item.label;
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => setActivePage(item.label)}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={cn(
                      'group relative w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors',
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
                      />
                    )}
                    <Icon className={cn('h-[16px] w-[16px] shrink-0', isActive ? 'text-primary' : 'text-zinc-500 group-hover:text-zinc-300')} strokeWidth={2} />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-2.5 space-y-0.5">
        {FOOTER_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              title={sidebarCollapsed ? item.label : undefined}
              className={cn(
                'w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] transition-colors',
                sidebarCollapsed && 'justify-center px-0'
              )}
            >
              <Icon className="h-[16px] w-[16px] shrink-0 text-zinc-500" strokeWidth={2} />
              {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}

        <button
          onClick={toggleSidebar}
          className={cn(
            'w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors mt-1',
            sidebarCollapsed && 'justify-center px-0'
          )}
        >
          {sidebarCollapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          {!sidebarCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
}
