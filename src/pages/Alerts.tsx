import { useState, useMemo } from 'react';
import { Search, Filter, AlertTriangle, RefreshCw, X, ChevronDown } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { SeverityBadge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { mockAlerts } from '@/lib/mockData';
import { timeAgo } from '@/lib/utils';
import type { Alert } from '@/lib/database.types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SEVERITIES = ['all', 'critical', 'high', 'medium', 'low', 'info'];
const STATUSES = ['all', 'open', 'investigating', 'resolved', 'false_positive'];
const CATEGORIES = ['all', 'Intrusion', 'Malware', 'Data Exfiltration', 'Web Attack', 'DDoS', 'Identity', 'Reconnaissance', 'Configuration'];

function AlertDetailModal({ alert, onClose }: { alert: Alert; onClose: () => void }) {
  const { canWrite } = useAuth();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="cyber-card w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-cyan-500/20">
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/10 sticky top-0 bg-[#0a1628]">
          <div className="flex items-center gap-3">
            <AlertTriangle size={16} className="text-orange-400" />
            <h3 className="text-sm font-semibold text-slate-200">Alert Details</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <h4 className="text-base font-bold text-slate-100">{alert.title}</h4>
            <p className="text-sm text-slate-400 mt-1">{alert.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SeverityBadge severity={alert.severity} />
            <StatusBadge status={alert.status} />
            {alert.tags?.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                #{tag}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Source', value: alert.source },
              { label: 'Category', value: alert.category },
              { label: 'Source IP', value: alert.source_ip ?? 'N/A' },
              { label: 'Dest IP', value: alert.destination_ip ?? 'N/A' },
              { label: 'Affected Asset', value: alert.affected_asset ?? 'N/A' },
              { label: 'Detected', value: timeAgo(alert.created_at) },
            ].map(({ label, value }) => (
              <div key={label} className="p-2.5 rounded bg-slate-900/50 border border-cyan-500/5">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-mono mb-0.5">{label}</p>
                <p className="text-xs text-slate-300 font-mono">{value}</p>
              </div>
            ))}
          </div>
          {alert.raw_data && Object.keys(alert.raw_data).length > 0 && (
            <div>
              <p className="text-xs text-slate-500 uppercase font-mono mb-2">Raw Data</p>
              <div className="terminal text-[11px] p-3">
                <pre>{JSON.stringify(alert.raw_data, null, 2)}</pre>
              </div>
            </div>
          )}
          {canWrite && (
            <div className="flex gap-2 pt-2 border-t border-cyan-500/10">
              <Button variant="warning" size="sm">Mark Investigating</Button>
              <Button variant="success" size="sm">Mark Resolved</Button>
              <Button variant="ghost" size="sm">False Positive</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Alerts() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'created_at' | 'severity'>('created_at');
  const { canWrite } = useAuth();

  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };

  const filteredAlerts = useMemo(() => {
    let result = [...mockAlerts];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q) ||
          a.source_ip?.includes(q) ||
          a.category?.toLowerCase().includes(q) ||
          a.tags?.some((t) => t.includes(q))
      );
    }
    if (severityFilter !== 'all') result = result.filter((a) => a.severity === severityFilter);
    if (statusFilter !== 'all') result = result.filter((a) => a.status === statusFilter);
    if (categoryFilter !== 'all') result = result.filter((a) => a.category === categoryFilter);
    result.sort((a, b) => {
      if (sortBy === 'severity') {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return result;
  }, [search, severityFilter, statusFilter, categoryFilter, sortBy]);

  const stats = useMemo(() => ({
    critical: mockAlerts.filter((a) => a.severity === 'critical' && a.status !== 'resolved').length,
    high: mockAlerts.filter((a) => a.severity === 'high' && a.status !== 'resolved').length,
    open: mockAlerts.filter((a) => a.status === 'open').length,
    investigating: mockAlerts.filter((a) => a.status === 'investigating').length,
  }), []);

  const handleExport = () => {
    const csv = [
      ['Title', 'Severity', 'Status', 'Source', 'Category', 'Created'],
      ...filteredAlerts.map((a) => [a.title, a.severity, a.status, a.source ?? '', a.category ?? '', a.created_at]),
    ].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'sentinel_alerts.csv'; link.click();
    toast.success('Alerts exported to CSV');
  };

  return (
    <div className="flex flex-col">
      <Header title="Security Alerts" subtitle={`${filteredAlerts.length} alerts • ${stats.critical} critical active`} />
      <div className="p-6 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Critical', value: stats.critical, color: 'text-red-400 border-red-500/20 bg-red-500/5' },
            { label: 'High', value: stats.high, color: 'text-orange-400 border-orange-500/20 bg-orange-500/5' },
            { label: 'Open', value: stats.open, color: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5' },
            { label: 'Investigating', value: stats.investigating, color: 'text-blue-400 border-blue-500/20 bg-blue-500/5' },
          ].map((stat) => (
            <div key={stat.label} className={`p-3 rounded-lg border ${stat.color} text-center`}>
              <p className={`text-2xl font-black font-mono ${stat.color.split(' ')[0]}`}>{stat.value}</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <Card className="p-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search alerts, IPs, tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="cyber-input pl-8 text-xs"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-ghost text-xs flex items-center gap-1.5 ${showFilters ? 'border-cyan-500/30 text-cyan-400' : ''}`}
            >
              <Filter size={13} />
              Filters
              <ChevronDown size={12} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'created_at' | 'severity')}
              className="cyber-input text-xs w-auto"
            >
              <option value="created_at">Sort: Newest</option>
              <option value="severity">Sort: Severity</option>
            </select>
            <Button variant="ghost" size="sm" icon={<RefreshCw size={13} />}>
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={handleExport}>
              Export CSV
            </Button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-cyan-500/10">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Severity:</span>
                {SEVERITIES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSeverityFilter(s)}
                    className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                      severityFilter === s
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Status:</span>
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                      statusFilter === s
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="cyber-input text-xs w-auto"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
              </select>
            </div>
          )}
        </Card>

        {/* Alerts Table */}
        <Card>
          {filteredAlerts.length === 0 ? (
            <div className="py-12 text-center">
              <AlertTriangle size={32} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No alerts match your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="cyber-table">
                <thead>
                  <tr>
                    <th>Severity</th>
                    <th>Alert Title</th>
                    <th>Source IP</th>
                    <th>Source</th>
                    <th>Category</th>
                    <th>Asset</th>
                    <th>Status</th>
                    <th>Time</th>
                    {canWrite && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredAlerts.map((alert) => (
                    <tr
                      key={alert.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <td><SeverityBadge severity={alert.severity} /></td>
                      <td>
                        <div className="max-w-xs">
                          <p className="text-xs font-medium text-slate-200 truncate">{alert.title}</p>
                          <p className="text-[10px] text-slate-500 truncate">{alert.description}</p>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-xs text-slate-400">
                          {alert.source_ip ?? '—'}
                        </span>
                      </td>
                      <td><span className="text-xs text-slate-400">{alert.source}</span></td>
                      <td><span className="text-xs text-slate-400">{alert.category}</span></td>
                      <td>
                        <span className="text-xs font-mono text-slate-400">
                          {alert.affected_asset ?? '—'}
                        </span>
                      </td>
                      <td><StatusBadge status={alert.status} /></td>
                      <td>
                        <span className="text-xs font-mono text-slate-500">
                          {timeAgo(alert.created_at)}
                        </span>
                      </td>
                      {canWrite && (
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-1">
                            <button
                              className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20"
                              onClick={() => toast.success('Alert marked as investigating')}
                            >
                              Investigate
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {selectedAlert && (
        <AlertDetailModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
      )}
    </div>
  );
}
