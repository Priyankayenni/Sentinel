import { Bell, Search, RefreshCw, Wifi } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockNotifications } from '@/lib/mockData';
import { timeAgo } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const unreadCount = mockNotifications.filter((n) => !n.is_read).length;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/alerts?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const notifTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      error: '🔴', warning: '🟡', success: '🟢', info: '🔵',
    };
    return icons[type] ?? '⚪';
  };

  return (
    <header className="sticky top-0 z-20 bg-[#050a0f]/90 backdrop-blur-xl border-b border-cyan-500/10 px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Title */}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-100">{title}</h2>
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 font-mono">{subtitle}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search threats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="cyber-input pl-8 pr-3 py-1.5 text-xs w-48 focus:w-64 transition-all"
            />
          </form>

          {/* Connection Status */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded border border-green-500/20 bg-green-500/5">
            <Wifi size={12} className="text-green-400" />
            <span className="text-[10px] text-green-400 font-mono">LIVE</span>
          </div>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded border border-cyan-500/10 hover:border-cyan-500/30 text-slate-500 hover:text-cyan-400 transition-colors"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-1.5 rounded border border-cyan-500/10 hover:border-cyan-500/30 text-slate-500 hover:text-cyan-400 transition-colors"
            >
              <Bell size={14} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold critical-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 top-full mt-2 w-80 cyber-card border border-cyan-500/20 shadow-2xl z-50">
                <div className="p-3 border-b border-cyan-500/10 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Notifications
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono">{unreadCount} unread</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-cyan-500/5">
                  {mockNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 hover:bg-cyan-500/5 transition-colors cursor-pointer ${!notif.is_read ? 'bg-cyan-500/3' : ''}`}
                      onClick={() => setShowNotifs(false)}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-sm flex-shrink-0">{notifTypeIcon(notif.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium ${notif.is_read ? 'text-slate-400' : 'text-slate-200'}`}>
                            {notif.title}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">{notif.message}</p>
                          <p className="text-[10px] text-slate-600 mt-0.5 font-mono">
                            {timeAgo(notif.created_at)}
                          </p>
                        </div>
                        {!notif.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-cyan-500/10 text-center">
                  <button className="text-xs text-cyan-400 hover:text-cyan-300">
                    Mark all as read
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs">
              {profile?.full_name?.charAt(0) ?? 'U'}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close notifs */}
      {showNotifs && (
        <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
      )}
    </header>
  );
}
