import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/app/dashboard', icon: 'LayoutDashboard' },
  { label: 'Datasets', path: '/app/datasets', icon: 'Database' },
  { label: 'SQL Editor', path: '/app/sql', icon: 'FileCode' },
  { label: 'Training', path: '/app/training', icon: 'Brain' },
  { label: 'AI Assistant', path: '/app/ai', icon: 'MessageSquare' },
  { label: 'Experiments', path: '/app/experiments', icon: 'FlaskConical' },
  { label: 'Explain', path: '/app/explain', icon: 'Sparkles' },
  { label: 'Evaluation', path: '/app/evaluation', icon: 'BarChart3' },
  { label: 'Models', path: '/app/models', icon: 'Layers' },
  { label: 'Deployments', path: '/app/deployments', icon: 'Rocket' },
  { label: 'Monitoring', path: '/app/monitoring', icon: 'Activity' },
  { label: 'Settings', path: '/app/settings', icon: 'Settings' },
];

const iconComponents: Record<string, string> = {
  LayoutDashboard: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  Database: 'M4 7c0-1.657 3.582-3 8-3s8 1.343 8 3M4 7v6c0 1.657 3.582 3 8 3s8-1.343 8-3V7M4 13v4c0 1.657 3.582 3 8 3s8-1.343 8-3v-4',
  FileCode: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6M10 13l-2 2 2 2M14 17l2-2-2-2',
  Brain: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707M2 12h1m15.657 5.657l.707.707M12 20v1M12 3a9 9 0 00-9 9c0 2.1.72 4.03 1.93 5.56L6 20l2.07-1.44A8.97 8.97 0 0012 21a9 9 0 009-9 9 9 0 00-9-9z',
  FlaskConical: 'M6 2h12v2l-4 6v8h-4v-8L6 4V2zM6 2v2l4 6',
  Layers: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  Rocket: 'M15.59 14.37a6 6 0 01-5.84 4.63 6 6 0 01-5.84-4.63M15.59 14.37a22 22 0 014.78-5.65A8.01 8.01 0 0014 2a22 22 0 00-5.65 4.78M15.59 14.37a6 6 0 01-.82 2.52 6 6 0 01-2 2 6 6 0 01-2.52.82m0 0a6 6 0 01-2.52-.82 6 6 0 01-2-2 6 6 0 01-.82-2.52M9 12a3 3 0 113 3 3 3 0 01-3-3z',
  Activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  Sparkles: 'M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM5 17l.5 1.5L7 19l-1.5.5L5 21l-.5-1.5L3 19l1.5-.5L5 17zM17 17l.5 1.5L19 19l-1.5.5L17 21l-.5-1.5L15 19l1.5-.5L17 17z',
  BarChart3: 'M18 20V10M12 20V4M6 20v-6',
  MessageSquare: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
  Settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
};

function NavIcon({ name }: { name: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={iconComponents[name] || ''} />
    </svg>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const userName = user?.name || 'Guest';
  const initials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <LogoIcon />
          <span className={styles.brand}>AutoML</span>
        </div>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className={styles.indicator}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.user}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{userName}</span>
            <span className={styles.userRole}>{user?.email || 'Guest'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function LogoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="currentColor" />
      <path d="M7 12h10M12 7v10" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
