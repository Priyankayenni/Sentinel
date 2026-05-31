import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  AlertTriangle, Shield, Zap, Globe, Activity,
  TrendingUp, Server, Eye, Lock, Clock
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { SeverityBadge, StatusBadge } from '@/components/ui/Badge';
import {
  threatTimelineData, weeklyThreatData, geoThreatData,
  attackTypeData, mockAlerts, mockNodes, STATS, mockThreatEvents
} from '@/lib/mockData';
import { timeAgo, getStatusColor } from '@/lib/utils';

const COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6',
};

// Animated counter hook
function useCounter(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function StatCard({
  label, value, subtext, icon, color, trend
}: {
  label: string; value: string | number; subtext?: string;
  icon: React.ReactNode; color: string; trend?: string;
}) {
  return (
    <Card hover glow="cyan" className="relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 ${color}`} />
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg bg-current/10 ${color}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${trend.startsWith('+') ? 'text-red-400 bg-red-500/10' : 'text-green-400 bg-green-500/10'}`}>
            {trend}
          </span>
        )}
      </div>
      <p className={`text-2xl font-black font-mono ${color}`}>{value}</p>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">{label}</p>
      {subtext && <p className="text-[10px] text-slate-600 mt-0.5">{subtext}</p>}
    </Card>
  );
}

function LiveThreatFeed() {
  const [events, setEvents] = useState(mockThreatEvents);

  useEffect(() => {
    const interval = setInterval(() => {
      const eventTypes = ['Port Scan', 'Brute Force', 'XSS Attempt', 'SQL Injection', 'C2 Beacon'];
      const countries = [
        { code: 'CN', name: 'China' }, { code: 'RU', name: 'Russia' },
        { code: 'IR', name: 'Iran' }, { code: 'KP', name: 'North Korea' }
      ];
      const severities = ['critical', 'high', 'medium'] as const;
      const country = countries[Math.floor(Math.random() * countries.length)];
      const newEvent = {
        id: `te-${Date.now()}`,
        event_type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        country_code: country.code,
        country_name: country.name,
        source_ip: `${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254)}.${Math.floor(Math.random() * 254)}.${Math.floor(Math.random() * 254)}`,
        target_asset: ['PROD-WEB-01', 'PROD-DB-01', 'AUTH-SERVICE', 'API-GW'][Math.floor(Math.random() * 4)],
        attack_vector: 'Network',
        blocked: Math.random() > 0.3,
        metadata: {},
        created_at: new Date().toISOString(),
      };
      setEvents((prev) => [newEvent, ...prev.slice(0, 9)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity size={14} className="text-cyan-400" />
          Live Threat Feed
        </CardTitle>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-red-500/20 bg-red-500/5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 pulse-slow" />
          <span className="text-[10px] text-red-400 font-mono">LIVE</span>
        </div>
      </CardHeader>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {events.map((event, i) => (
          <div
            key={event.id}
            className={`flex items-center gap-3 p-2.5 rounded-md border transition-all ${
              i === 0 ? 'border-cyan-500/20 bg-cyan-500/5 fade-in-up' : 'border-transparent hover:border-cyan-500/10 hover:bg-cyan-500/3'
            }`}
          >
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
              event.blocked ? 'bg-green-400' : 'bg-red-400 critical-pulse'
            }`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-300 truncate">{event.event_type}</span>
                <SeverityBadge severity={event.severity} />
              </div>
              <p className="text-[10px] text-slate-500 font-mono truncate">
                {event.source_ip} → {event.target_asset} | {event.country_name}
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <span className={`text-[10px] font-mono font-bold ${event.blocked ? 'text-green-400' : 'text-red-400'}`}>
                {event.blocked ? 'BLOCKED' : 'ACTIVE'}
              </span>
              <p className="text-[10px] text-slate-600">{timeAgo(event.created_at)}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function InfrastructureHealth() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server size={14} className="text-cyan-400" />
          Infrastructure Health
        </CardTitle>
      </CardHeader>
      <div className="space-y-2">
        {mockNodes.map((node) => (
          <div key={node.id} className="flex items-center gap-3 p-2 rounded hover:bg-cyan-500/3 transition-colors">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 status-${node.status}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-300">{node.name}</span>
                <StatusBadge status={node.status} />
              </div>
              {node.status !== 'offline' && node.cpu_usage !== null && (
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { label: 'CPU', value: node.cpu_usage! },
                    { label: 'MEM', value: node.memory_usage! },
                    { label: 'DSK', value: node.disk_usage! },
                  ].map((metric) => (
                    <div key={metric.label}>
                      <div className="flex justify-between mb-0.5">
                        <span className="text-[9px] text-slate-600 font-mono">{metric.label}</span>
                        <span className={`text-[9px] font-mono ${metric.value > 80 ? 'text-red-400' : metric.value > 60 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {metric.value?.toFixed(0)}%
                        </span>
                      </div>
                      <div className="cyber-progress">
                        <div
                          className={`cyber-progress-bar ${metric.value > 80 ? 'bg-gradient-to-r from-red-500 to-red-600' : metric.value > 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : ''}`}
                          style={{ width: `${metric.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function GeoThreatMap() {
  const maxAttacks = Math.max(...geoThreatData.map((d) => d.attacks));
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe size={14} className="text-cyan-400" />
          Top Attack Origins
        </CardTitle>
      </CardHeader>
      <div className="space-y-2">
        {geoThreatData.slice(0, 8).map((item, i) => (
          <div key={item.code} className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono w-4 text-right">{i + 1}</span>
            <span className="text-sm">{item.flag}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs text-slate-300">{item.country}</span>
                <span className="text-xs font-mono text-slate-400">{item.attacks.toLocaleString()}</span>
              </div>
              <div className="cyber-progress">
                <div
                  className="h-full rounded-sm transition-all duration-500"
                  style={{
                    width: `${(item.attacks / maxAttacks) * 100}%`,
                    background: `linear-gradient(90deg, ${item.color}88, ${item.color})`,
                    boxShadow: `0 0 6px ${item.color}66`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload) return null;
  return (
    <div className="cyber-card border border-cyan-500/20 p-2.5 text-xs">
      <p className="text-slate-400 font-mono mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="font-mono" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

export function Dashboard() {
  const totalThreats = useCounter(STATS.totalThreats);
  const blockedAttacks = useCounter(STATS.blockedAttacks);
  const assetsMonitored = useCounter(STATS.assetsMonitored);
  const [riskScore] = useState(STATS.riskScore);

  // Live updating threat counter
  const [liveCount, setLiveCount] = useState(totalThreats);
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount((prev) => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col">
      <Header
        title="Security Operations Dashboard"
        subtitle={`Last updated: ${new Date().toLocaleTimeString()}`}
      />
      <div className="p-6 space-y-6">
        {/* Risk Score Banner */}
        <div className="cyber-card p-4 border-l-4 border-yellow-500/60 bg-yellow-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle size={16} className="text-yellow-400" />
              <div>
                <p className="text-sm font-semibold text-yellow-400">ELEVATED RISK LEVEL</p>
                <p className="text-xs text-slate-400">3 critical incidents active — Immediate attention required</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black font-mono text-yellow-400">{riskScore}</p>
              <p className="text-[10px] text-slate-500 font-mono">RISK SCORE /100</p>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Threats"
            value={liveCount.toLocaleString()}
            subtext="Last 24 hours"
            icon={<AlertTriangle size={16} />}
            color="text-red-400"
            trend="+12.3%"
          />
          <StatCard
            label="Blocked"
            value={blockedAttacks.toLocaleString()}
            subtext={`${((blockedAttacks / Math.max(liveCount, 1)) * 100).toFixed(1)}% block rate`}
            icon={<Shield size={16} />}
            color="text-green-400"
          />
          <StatCard
            label="Active Alerts"
            value={STATS.activeAlerts}
            subtext={`${STATS.criticalAlerts} critical`}
            icon={<Zap size={16} />}
            color="text-orange-400"
            trend="+3"
          />
          <StatCard
            label="Assets Monitored"
            value={assetsMonitored}
            subtext="99.2% uptime"
            icon={<Eye size={16} />}
            color="text-cyan-400"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Threat Timeline — 2/3 width */}
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp size={14} className="text-cyan-400" />
                Threat Timeline (24h)
              </CardTitle>
            </CardHeader>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={threatTimelineData}>
                <defs>
                  <linearGradient id="critGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="medGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.05)" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#4a5568' }} />
                <YAxis tick={{ fontSize: 10, fill: '#4a5568' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="critical" name="Critical" stroke={COLORS.critical} fill="url(#critGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="high" name="High" stroke={COLORS.high} fill="url(#highGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="medium" name="Medium" stroke={COLORS.medium} fill="url(#medGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Attack Types Pie */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock size={14} className="text-cyan-400" />
                Attack Types
              </CardTitle>
            </CardHeader>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={attackTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {attackTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.[0] ? (
                      <div className="cyber-card border border-cyan-500/20 p-2 text-xs">
                        <p style={{ color: payload[0].payload.color }}>{payload[0].name}: {payload[0].value}%</p>
                      </div>
                    ) : null
                  }
                />
                <Legend
                  formatter={(value) => <span className="text-[10px] text-slate-400">{value}</span>}
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Weekly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={14} className="text-cyan-400" />
              Weekly Threat Trends
            </CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyThreatData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#4a5568' }} />
              <YAxis tick={{ fontSize: 11, fill: '#4a5568' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="threats" name="Threats" fill="#ef4444" opacity={0.7} radius={[2, 2, 0, 0]} />
              <Bar dataKey="blocked" name="Blocked" fill="#22c55e" opacity={0.7} radius={[2, 2, 0, 0]} />
              <Bar dataKey="incidents" name="Incidents" fill="#f97316" opacity={0.7} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <LiveThreatFeed />
          <GeoThreatMap />
          <InfrastructureHealth />
        </div>

        {/* Recent Alerts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={14} className="text-cyan-400" />
              Recent Alerts
            </CardTitle>
            <a href="/alerts" className="text-xs text-cyan-400 hover:text-cyan-300 font-mono">
              View All →
            </a>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Alert</th>
                  <th>Source</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {mockAlerts.slice(0, 6).map((alert) => (
                  <tr key={alert.id}>
                    <td><SeverityBadge severity={alert.severity} /></td>
                    <td>
                      <span className="text-slate-200 text-xs font-medium">{alert.title}</span>
                      {alert.source_ip && (
                        <p className="text-[10px] text-slate-500 font-mono">{alert.source_ip}</p>
                      )}
                    </td>
                    <td><span className="text-xs font-mono text-slate-400">{alert.source}</span></td>
                    <td><span className="text-xs text-slate-400">{alert.category}</span></td>
                    <td><StatusBadge status={alert.status} /></td>
                    <td><span className={`text-xs font-mono ${getStatusColor(alert.status)}`}>{timeAgo(alert.created_at)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
