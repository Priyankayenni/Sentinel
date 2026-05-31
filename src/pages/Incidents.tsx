import { useState, useMemo } from 'react';
import { Siren, Plus, ChevronDown, ChevronRight, X, Clock, User, AlertTriangle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { SeverityBadge, StatusBadge, Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { mockIncidents } from '@/lib/mockData';
import type { Incident } from '@/lib/database.types';
import { timeAgo, formatDateTime, generateId } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

function IncidentTimeline({ timeline }: { timeline: Incident['timeline'] }) {
  return (
    <div className="relative pl-6">
      {timeline.map((entry, i) => (
        <div key={i} className="relative mb-4 last:mb-0">
          <div className="absolute -left-3 top-1 w-2 h-2 rounded-full bg-cyan-400 border-2 border-[#0a1628]" />
          {i < timeline.length - 1 && (
            <div className="absolute -left-2.5 top-3 bottom-0 w-px bg-cyan-500/20" />
          )}
          <div className="p-2.5 rounded bg-slate-900/50 border border-cyan-500/5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-300">{entry.action}</span>
              <span className="text-[10px] text-slate-500 font-mono">{timeAgo(entry.timestamp)}</span>
            </div>
            <p className="text-xs text-slate-400">{entry.notes}</p>
            <div className="flex items-center gap-1 mt-1">
              <User size={10} className="text-slate-600" />
              <span className="text-[10px] text-slate-500">{entry.user}</span>
              <span className="text-[10px] text-slate-600">• {formatDateTime(entry.timestamp)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function IncidentModal({ incident, onClose, onUpdate }: {
  incident: Incident;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Incident>) => void;
}) {
  const { canWrite, profile } = useAuth();
  const [note, setNote] = useState('');

  const handleUpdateStatus = (status: Incident['status']) => {
    onUpdate(incident.id, { status });
    toast.success(`Incident status updated to ${status}`);
  };

  const handleAddNote = () => {
    if (!note.trim()) return;
    const newEntry = {
      timestamp: new Date().toISOString(),
      action: 'Note Added',
      user: profile?.full_name ?? 'Unknown',
      notes: note,
    };
    onUpdate(incident.id, { timeline: [...incident.timeline, newEntry] });
    setNote('');
    toast.success('Note added to timeline');
  };

  const priorityColor = {
    critical: 'text-red-400', high: 'text-orange-400', medium: 'text-yellow-400', low: 'text-blue-400',
  }[incident.priority];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="cyber-card w-full max-w-3xl max-h-[92vh] overflow-y-auto border border-cyan-500/20">
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/10 sticky top-0 bg-[#0a1628] z-10">
          <div className="flex items-center gap-3">
            <Siren size={16} className="text-orange-400" />
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Incident #{incident.id.slice(4, 8).toUpperCase()}</h3>
              <p className={`text-xs font-mono font-bold ${priorityColor}`}>{incident.priority.toUpperCase()} PRIORITY</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <h4 className="text-base font-bold text-slate-100 mb-1">{incident.title}</h4>
            <p className="text-sm text-slate-400">{incident.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusBadge status={incident.status} />
            <SeverityBadge severity={incident.priority} />
            <Badge variant="info">{incident.category ?? 'Uncategorized'}</Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: 'Created', value: timeAgo(incident.created_at) },
              { label: 'Updated', value: timeAgo(incident.updated_at) },
              { label: 'Assigned To', value: incident.assigned_to ? 'Sam Analyst' : 'Unassigned' },
              { label: 'Category', value: incident.category ?? 'N/A' },
              { label: 'Affected Systems', value: incident.affected_systems?.join(', ') || 'N/A' },
              { label: 'Alert Count', value: String(incident.alert_ids?.length ?? 0) },
            ].map(({ label, value }) => (
              <div key={label} className="p-2.5 rounded bg-slate-900/50 border border-cyan-500/5">
                <p className="text-[10px] text-slate-500 uppercase font-mono mb-0.5">{label}</p>
                <p className="text-xs text-slate-300 font-mono">{value}</p>
              </div>
            ))}
          </div>

          {incident.resolution_notes && (
            <div className="p-3 rounded bg-green-500/5 border border-green-500/20">
              <p className="text-[10px] font-mono text-green-400 uppercase mb-1">Resolution Notes</p>
              <p className="text-xs text-slate-300">{incident.resolution_notes}</p>
            </div>
          )}

          {/* Timeline */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 font-mono">
              Incident Timeline
            </p>
            <IncidentTimeline timeline={incident.timeline} />
          </div>

          {/* Add Note */}
          {canWrite && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 font-mono uppercase">Add Timeline Note</p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add investigation notes, actions taken..."
                className="cyber-input resize-none text-xs"
                rows={3}
              />
              <Button variant="primary" size="sm" onClick={handleAddNote}>
                Add Note
              </Button>
            </div>
          )}

          {/* Actions */}
          {canWrite && (
            <div className="flex flex-wrap gap-2 pt-3 border-t border-cyan-500/10">
              <Button size="sm" variant="warning" onClick={() => handleUpdateStatus('in_progress')}>
                Mark In Progress
              </Button>
              <Button size="sm" variant="success" onClick={() => handleUpdateStatus('resolved')}>
                Mark Resolved
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleUpdateStatus('closed')}>
                Close Incident
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NewIncidentModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (incident: Incident) => void;
}) {
  const { profile } = useAuth();
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as Incident['priority'],
    category: '',
    affected_systems: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newIncident: Incident = {
      id: `inc-${generateId()}`,
      title: form.title,
      description: form.description,
      status: 'open',
      priority: form.priority,
      category: form.category,
      affected_systems: form.affected_systems.split(',').map(s => s.trim()).filter(Boolean),
      assigned_to: null,
      created_by: profile?.id ?? 'unknown',
      resolved_at: null,
      resolution_notes: null,
      alert_ids: [],
      timeline: [{
        timestamp: new Date().toISOString(),
        action: 'Incident Created',
        user: profile?.full_name ?? 'Unknown',
        notes: `Incident created by ${profile?.full_name}`,
      }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    onCreate(newIncident);
    toast.success('Incident created successfully');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="cyber-card w-full max-w-lg border border-cyan-500/20">
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/10">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Plus size={14} className="text-cyan-400" />
            Create New Incident
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-slate-400 uppercase font-mono mb-1.5">Title *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="cyber-input text-sm"
              placeholder="Incident title..."
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 uppercase font-mono mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="cyber-input text-xs resize-none"
              rows={3}
              placeholder="Detailed description..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 uppercase font-mono mb-1.5">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as Incident['priority'] })}
                className="cyber-input text-sm"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 uppercase font-mono mb-1.5">Category</label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="cyber-input text-sm"
                placeholder="e.g., Malware, DDoS..."
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 uppercase font-mono mb-1.5">
              Affected Systems (comma-separated)
            </label>
            <input
              value={form.affected_systems}
              onChange={(e) => setForm({ ...form, affected_systems: e.target.value })}
              className="cyber-input text-sm"
              placeholder="PROD-WEB-01, PROD-DB-01..."
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" variant="primary" icon={<Plus size={13} />}>
              Create Incident
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Incidents() {
  const [incidents, setIncidents] = useState(mockIncidents);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { canWrite } = useAuth();

  const filteredIncidents = useMemo(() => {
    let result = [...incidents];
    if (filter !== 'all') result = result.filter((i) => i.status === filter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((i) =>
        i.title.toLowerCase().includes(q) ||
        i.category?.toLowerCase().includes(q) ||
        i.affected_systems?.some((s) => s.toLowerCase().includes(q))
      );
    }
    return result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }, [incidents, filter, search]);

  const stats = useMemo(() => ({
    total: incidents.length,
    open: incidents.filter((i) => i.status === 'open').length,
    in_progress: incidents.filter((i) => i.status === 'in_progress').length,
    resolved: incidents.filter((i) => i.status === 'resolved').length,
    critical: incidents.filter((i) => i.priority === 'critical').length,
  }), [incidents]);

  const handleUpdate = (id: string, updates: Partial<Incident>) => {
    setIncidents((prev) =>
      prev.map((i) => i.id === id ? { ...i, ...updates, updated_at: new Date().toISOString() } : i)
    );
    if (selectedIncident?.id === id) {
      setSelectedIncident((prev) => prev ? { ...prev, ...updates } : null);
    }
  };

  const priorityColors = {
    critical: 'border-l-red-500',
    high: 'border-l-orange-500',
    medium: 'border-l-yellow-500',
    low: 'border-l-blue-500',
  };

  return (
    <div className="flex flex-col">
      <Header title="Incident Management" subtitle={`${stats.open} open • ${stats.in_progress} in progress`} />
      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'text-slate-300' },
            { label: 'Open', value: stats.open, color: 'text-red-400' },
            { label: 'In Progress', value: stats.in_progress, color: 'text-yellow-400' },
            { label: 'Resolved', value: stats.resolved, color: 'text-green-400' },
            { label: 'Critical', value: stats.critical, color: 'text-red-400' },
          ].map((stat) => (
            <div key={stat.label} className="cyber-card p-3 text-center">
              <p className={`text-xl font-black font-mono ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-slate-500 uppercase">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-40">
            <input
              type="text"
              placeholder="Search incidents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="cyber-input pl-3 text-xs"
            />
          </div>
          <div className="flex gap-1">
            {['all', 'open', 'in_progress', 'resolved', 'closed'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  filter === s
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-500 hover:text-slate-300 border border-transparent'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
          {canWrite && (
            <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => setShowNewModal(true)}>
              New Incident
            </Button>
          )}
        </div>

        {/* Incidents List */}
        <div className="space-y-2">
          {filteredIncidents.length === 0 ? (
            <Card className="py-12 text-center">
              <AlertTriangle size={32} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500">No incidents found</p>
            </Card>
          ) : filteredIncidents.map((incident) => (
            <Card
              key={incident.id}
              className={`border-l-4 ${priorityColors[incident.priority]} cursor-pointer hover:border-cyan-500/20 transition-all`}
            >
              <div
                className="flex items-start gap-3"
                onClick={() => setExpandedId(expandedId === incident.id ? null : incident.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-mono text-slate-500">
                      #{incident.id.slice(4, 8).toUpperCase()}
                    </span>
                    <StatusBadge status={incident.status} />
                    <SeverityBadge severity={incident.priority} />
                    <Badge variant="info">{incident.category ?? 'General'}</Badge>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200 mb-1">{incident.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{incident.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <Clock size={10} />
                      {timeAgo(incident.updated_at)}
                    </div>
                    {incident.affected_systems?.length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <span>Systems: {incident.affected_systems.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); setSelectedIncident(incident); }}
                  >
                    Details
                  </Button>
                  {expandedId === incident.id
                    ? <ChevronDown size={16} className="text-slate-500" />
                    : <ChevronRight size={16} className="text-slate-500" />
                  }
                </div>
              </div>

              {expandedId === incident.id && (
                <div className="mt-3 pt-3 border-t border-cyan-500/10 slide-in-left">
                  <p className="text-[10px] font-mono text-slate-500 uppercase mb-2">Quick Timeline</p>
                  <div className="space-y-1.5">
                    {incident.timeline.slice(-3).map((entry, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="text-cyan-400">→</span>
                        <span className="text-slate-300">{entry.action}</span>
                        <span className="text-slate-500">• {timeAgo(entry.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {selectedIncident && (
        <IncidentModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onUpdate={handleUpdate}
        />
      )}
      {showNewModal && (
        <NewIncidentModal
          onClose={() => setShowNewModal(false)}
          onCreate={(inc) => setIncidents((prev) => [inc, ...prev])}
        />
      )}
    </div>
  );
}
