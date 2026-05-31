import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Shield, Bug, AlertTriangle, FileText,
  Settings, Key, Activity, LogOut, ChevronLeft, ChevronRight,
  Cpu, Siren
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  role?: 'admin' | 'analyst' | 'viewer';
  badge?: number;
}

const navItems: NavItem[] = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/alerts', icon: <AlertTriangle size={18} />, label: 'Alerts' },
  { to: '/incidents', icon: <Siren size={18} />, label: 'Incidents' },
  { to: '/scanner', icon: <Bug size={18} />, label: 'Vuln Scanner', role: 'analyst' },
  { to: '/password', icon: <Shield size={18} />, label: 'Password Analyzer' },
  { to: '/activity', icon: <Activity size={18} />, label: 'Activity Log' },
  { to: '/reports', icon: <FileText size={18} />, label: 'Reports' },
  { to: '/settings', icon: <Settings size={18} />, label: 'Settings', role: 'admin' },
  { to: '/api-keys', icon: <Key size={18} />, label: 'API Keys' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const visibleItems = navItems.filter((item) => {
    if (!item.role) return true;
    if (!profile) return false;
    const hierarchy = { admin: 3, analyst: 2, viewer: 1 };
    return hierarchy[profile.role] >= hierarchy[item.role];
  });

  return (
    <aside
      className={cn(
        'flex flex-col h-screen sticky top-0 transition-all duration-300 z-30',
        'border-r border-cyan-500/10',
        'bg-gradient-to-b from-[#060c18] to-[#050a12]',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5 border-b border-cyan-500/10',
        collapsed && 'justify-center px-2'
      )}>
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Cpu size={18} className="text-cyan-400" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full status-online" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-sm font-bold text-cyan-400 font-mono tracking-widest text-glow-cyan">
              SENTINEL
            </h1>
            <p className="text-[10px] text-slate-500 font-mono">SECURITY OPS CENTER</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest px-2 mb-2">
            Navigation
          </p>
        )}
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn('sidebar-item', isActive && 'active', collapsed && 'justify-center px-0')
            }
            title={collapsed ? item.label : undefined}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="flex-1">{item.label}</span>}
            {!collapsed && item.badge && (
              <span className="ml-auto bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div className="border-t border-cyan-500/10 p-3">
        {!collapsed ? (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm">
              {profile?.full_name?.charAt(0) ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">
                {profile?.full_name ?? 'Unknown'}
              </p>
              <p className="text-[10px] text-cyan-500 font-mono uppercase">
                {profile?.role ?? 'viewer'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-2">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm">
              {profile?.full_name?.charAt(0) ?? 'U'}
            </div>
          </div>
        )}

        <button
          onClick={handleSignOut}
          className={cn(
            'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-slate-500',
            'hover:text-red-400 hover:bg-red-500/5 transition-colors',
            collapsed && 'justify-center'
          )}
        >
          <LogOut size={14} />
          {!collapsed && 'Sign Out'}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-800 border border-cyan-500/20 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
