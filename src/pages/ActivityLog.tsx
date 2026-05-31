import { useState, useMemo } from 'react';
import { Activity, Search, Filter, User, Clock } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { mockActivityLogs } from '@/lib/mockData';
import { timeAgo } from '@/lib/utils';

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'text-green-400 bg-green-500/10 border-green-500/20',
  LOGOUT: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  SCAN_CREATED: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  ALERT_UPDATED: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  INCIDENT_CREATED: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  INCIDENT_UPDATED: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  ROLE_CHANGED: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  PASSWORD_CHECK: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  REPORT_GENERATED: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
  API_KEY_CREATED: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
};

const USER_NAMES: Record<string, string> = {
  'demo-admin-id': 'Alex Admin',
  'demo-analyst-id': 'Sam Analyst',
  'demo-viewer-id': 'Val Viewer',
};

// Generate more demo activity
function generateDemoLogs() {
  const base = [...mockActivityLogs];
  const actions = ['LOGIN', 'ALERT_UPDATED', 'SCAN_CREATED', 'INCIDENT_UPDATED', 'PASSWORD_CHECK', 'LOGOUT', 'REPORT_GENERATED'];
  const users = ['demo-admin-id', 'demo-analyst-id', 'demo-viewer-id'];

  for (let i = 0; i < 30; i++) {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    base.push({
      id: `log-gen-${i}`,
      user_id: user,
      action,
      resource_type: action.includes('ALERT') ? 'alert' : action.includes('SCAN') ? 'scan_report' : null,
      resource_id: null,
      details: {},
      ip_address: `192.168.1.${Math.floor(Math.random() * 50) + 5}`,
      user_agent: ['Chrome/120', 'Firefox/121', 'Safari/17'][Math.floor(Math.random() * 3)],
      created_at: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 48).toISOString(),
    });
  }

  return base.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

const ALL_LOGS = generateDemoLogs();

export function ActivityLog() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');

  const uniqueActions = useMemo(() => ['all', ...new Set(ALL_LOGS.map((l) => l.action))], []);

  const filteredLogs = useMemo(() => {
    return ALL_LOGS.filter((log) => {
      if (actionFilter !== 'all' && log.action !== actionFilter) return false;
      if (userFilter !== 'all' && log.user_id !== userFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          log.action.toLowerCase().includes(q) ||
          log.ip_address?.includes(q) ||
          USER_NAMES[log.user_id ?? '']?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, actionFilter, userFilter]);

  const stats = useMemo(() => {
    const today = ALL_LOGS.filter((l) => new Date(l.created_at) > new Date(Date.now() - 86400000));
    return {
      total: ALL_LOGS.length,
      today: today.length,
      logins: ALL_LOGS.filter((l) => l.action === 'LOGIN').length,
      critical: ALL_LOGS.filter((l) => ['ROLE_CHANGED', 'API_KEY_CREATED'].includes(l.action)).length,
    };
  }, []);

  return (
    <div className="flex flex-col">
      <Header title="Activity Log" subtitle="Complete audit trail of all system actions" />
      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Events', value: stats.total, color: 'text-slate-300' },
            { label: 'Today', value: stats.today, color: 'text-cyan-400' },
            { label: 'Logins', value: stats.logins, color: 'text-green-400' },
            { label: 'Privileged Actions', value: stats.critical, color: 'text-yellow-400' },
          ].map((stat) => (
            <div key={stat.label} className="cyber-card p-3 text-center">
              <p className={`text-xl font-black font-mono ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-slate-500 uppercase">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <Card className="p-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-40">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search actions, IPs, users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="cyber-input pl-8 text-xs"
              />
            </div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="cyber-input text-xs w-auto"
            >
              {uniqueActions.map((a) => (
                <option key={a} value={a}>{a === 'all' ? 'All Actions' : a}</option>
              ))}
            </select>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="cyber-input text-xs w-auto"
            >
              <option value="all">All Users</option>
              {Object.entries(USER_NAMES).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
            <span className="text-xs text-slate-500 font-mono">
              {filteredLogs.length} events
            </span>
          </div>
        </Card>

        {/* Activity Stream */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={14} className="text-cyan-400" />
              Audit Trail
            </CardTitle>
          </CardHeader>
          <div className="space-y-1 max-h-[600px] overflow-y-auto">
            {filteredLogs.map((log, i) => {
              const actionColor = ACTION_COLORS[log.action] ?? 'text-slate-400 bg-slate-500/10 border-slate-500/20';
              const userName = USER_NAMES[log.user_id ?? ''] ?? 'System';

              return (
                <div
                  key={log.id}
                  className={`flex items-start gap-3 p-3 rounded-md hover:bg-cyan-500/3 transition-colors ${i === 0 ? 'fade-in-up' : ''}`}
                >
                  {/* Action Badge */}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold border flex-shrink-0 w-36 justify-center ${actionColor}`}>
                    {log.action.replace(/_/g, ' ')}
                  </span>

                  {/* User */}
                  <div className="flex items-center gap-1.5 flex-shrink-0 w-28">
                    <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-[9px] font-bold">
                      {userName.charAt(0)}
                    </div>
                    <span className="text-xs text-slate-400 truncate">{userName}</span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    {log.resource_type && (
                      <Badge variant="info" className="text-[9px] px-1.5 py-0 mr-1.5">
                        {log.resource_type}
                      </Badge>
                    )}
                    {Object.keys(log.details).length > 0 && (
                      <span className="text-xs text-slate-400 font-mono">
                        {JSON.stringify(log.details).slice(0, 60)}
                      </span>
                    )}
                  </div>

                  {/* IP */}
                  {log.ip_address && (
                    <span className="text-[10px] font-mono text-slate-600 flex-shrink-0">{log.ip_address}</span>
                  )}

                  {/* Time */}
                  <div className="flex items-center gap-1 flex-shrink-0 text-right">
                    <Clock size={9} className="text-slate-600" />
                    <span className="text-[10px] text-slate-500 font-mono">{timeAgo(log.created_at)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Action Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter size={14} className="text-cyan-400" />
                Actions by Type
              </CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {uniqueActions.filter((a) => a !== 'all').map((action) => {
                const count = ALL_LOGS.filter((l) => l.action === action).length;
                const pct = Math.round((count / ALL_LOGS.length) * 100);
                const color = ACTION_COLORS[action] ?? 'text-slate-400';
                return (
                  <div key={action} className="flex items-center gap-3">
                    <span className={`text-[10px] font-mono w-36 flex-shrink-0 ${color.split(' ')[0]}`}>
                      {action}
                    </span>
                    <div className="flex-1 cyber-progress">
                      <div
                        className="h-full bg-cyan-500/60 rounded-sm transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={14} className="text-cyan-400" />
                Activity by User
              </CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {Object.entries(USER_NAMES).map(([userId, name]) => {
                const count = ALL_LOGS.filter((l) => l.user_id === userId).length;
                const pct = Math.round((count / ALL_LOGS.length) * 100);
                const logins = ALL_LOGS.filter((l) => l.user_id === userId && l.action === 'LOGIN').length;
                return (
                  <div key={userId} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-[10px] font-bold flex-shrink-0">
                      {name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-300">{name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{count} events</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 cyber-progress">
                          <div className="h-full bg-cyan-500/60 rounded-sm" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[9px] text-green-400 font-mono">{logins} logins</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
