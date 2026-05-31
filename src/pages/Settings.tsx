import { useState } from 'react';
import { User, Shield, Bell, Save, Camera, Users, Lock } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { UserRole } from '@/lib/database.types';

const DEMO_TEAM = [
  { id: 'demo-admin-id', name: 'Alex Admin', email: 'admin@sentinel.io', role: 'admin' as UserRole, department: 'Security Operations', status: 'active' },
  { id: 'demo-analyst-id', name: 'Sam Analyst', email: 'analyst@sentinel.io', role: 'analyst' as UserRole, department: 'Threat Intelligence', status: 'active' },
  { id: 'demo-viewer-id', name: 'Val Viewer', email: 'viewer@sentinel.io', role: 'viewer' as UserRole, department: 'Management', status: 'active' },
];

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Full system access — user management, all CRUD operations, role assignment',
  analyst: 'Read + write access — run scans, manage alerts/incidents, password analysis',
  viewer: 'Read-only access — view dashboard, alerts, reports (no modifications)',
};

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'text-red-400 bg-red-500/10 border-red-500/30',
  analyst: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  viewer: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
};

function ProfileSection() {
  const { profile, updateProfile } = useAuth();
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    department: profile?.department ?? '',
    email: profile?.email ?? '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile({ full_name: form.full_name, department: form.department });
    setSaving(false);
    if (error) toast.error(error);
    else toast.success('Profile updated successfully');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User size={14} className="text-cyan-400" />
          Profile Information
        </CardTitle>
      </CardHeader>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-500/40 flex items-center justify-center text-2xl font-bold text-cyan-400">
              {profile?.full_name?.charAt(0) ?? 'U'}
            </div>
            <button className="absolute bottom-0 right-0 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
              <Camera size={10} className="text-black" />
            </button>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-200">{profile?.full_name}</p>
            <p className="text-xs text-slate-500">{profile?.email}</p>
            <div className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-mono font-bold mt-1 ${ROLE_COLORS[profile?.role ?? 'viewer']}`}>
              {profile?.role?.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 uppercase font-mono mb-1.5">Full Name</label>
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="cyber-input text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 uppercase font-mono mb-1.5">Email</label>
            <input value={form.email} disabled className="cyber-input text-sm opacity-50 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 uppercase font-mono mb-1.5">Department</label>
            <input
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="cyber-input text-sm"
              placeholder="e.g., Security Operations"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 uppercase font-mono mb-1.5">Role</label>
            <input value={profile?.role?.toUpperCase()} disabled className="cyber-input text-sm opacity-50 cursor-not-allowed font-mono" />
          </div>
        </div>

        <Button variant="primary" loading={saving} icon={<Save size={13} />} onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </Card>
  );
}

function SecuritySection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (newPassword.length < 12) { toast.error('Password must be at least 12 characters'); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    toast.success('Password changed successfully');
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock size={14} className="text-cyan-400" />
          Security Settings
        </CardTitle>
      </CardHeader>
      <div className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-400 uppercase font-mono mb-1.5">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="cyber-input text-sm"
              placeholder="••••••••••••"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 uppercase font-mono mb-1.5">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="cyber-input text-sm"
              placeholder="••••••••••••"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 uppercase font-mono mb-1.5">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="cyber-input text-sm"
              placeholder="••••••••••••"
            />
          </div>
          <Button variant="primary" loading={saving} icon={<Lock size={13} />} onClick={handleChangePassword}>
            Update Password
          </Button>
        </div>

        <div className="pt-4 border-t border-cyan-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-200">Multi-Factor Authentication</p>
              <p className="text-xs text-slate-500">Require TOTP/authenticator app on login</p>
            </div>
            <button
              onClick={() => { setMfaEnabled(!mfaEnabled); toast.success(`MFA ${!mfaEnabled ? 'enabled' : 'disabled'}`); }}
              className={`relative w-10 h-5 rounded-full transition-colors ${mfaEnabled ? 'bg-cyan-500' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${mfaEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        <div className="p-3 rounded bg-yellow-500/5 border border-yellow-500/20">
          <p className="text-xs text-yellow-400 font-mono">⚠️ Active Sessions</p>
          <div className="mt-2 space-y-1.5">
            {[
              { device: 'Chrome/120 — Windows 11', ip: '192.168.1.5', active: true, time: 'Now' },
              { device: 'Firefox/121 — macOS', ip: '192.168.1.10', active: false, time: '2h ago' },
            ].map((session, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div>
                  <span className={`font-mono ${session.active ? 'text-green-400' : 'text-slate-400'}`}>
                    {session.active ? '● ' : '○ '}{session.device}
                  </span>
                  <span className="text-slate-600 ml-2">{session.ip}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">{session.time}</span>
                  {!session.active && (
                    <button className="text-red-400 hover:text-red-300 text-[10px]" onClick={() => toast.success('Session revoked')}>
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function NotificationsSection() {
  const [settings, setSettings] = useState({
    critical_alerts: true,
    high_alerts: true,
    new_incidents: true,
    scan_complete: true,
    weekly_report: false,
    breach_detected: true,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success('Notification preference saved');
  };

  const notifOptions = [
    { key: 'critical_alerts', label: 'Critical Alert Notifications', desc: 'Immediate alerts for critical severity threats' },
    { key: 'high_alerts', label: 'High Alert Notifications', desc: 'Alerts for high severity security events' },
    { key: 'new_incidents', label: 'New Incident Created', desc: 'Notify when a new security incident is opened' },
    { key: 'scan_complete', label: 'Scan Completion', desc: 'Notify when vulnerability scan finishes' },
    { key: 'weekly_report', label: 'Weekly Summary Email', desc: 'Weekly security posture summary report' },
    { key: 'breach_detected', label: 'Breach Detection Alerts', desc: 'Immediate notification on breach detection' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell size={14} className="text-cyan-400" />
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <div className="space-y-3">
        {notifOptions.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between py-2 border-b border-cyan-500/5 last:border-0">
            <div>
              <p className="text-xs font-medium text-slate-300">{label}</p>
              <p className="text-[10px] text-slate-500">{desc}</p>
            </div>
            <button
              onClick={() => toggle(key as keyof typeof settings)}
              className={`relative w-9 h-4.5 rounded-full transition-colors flex-shrink-0 ${settings[key as keyof typeof settings] ? 'bg-cyan-500' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform ${settings[key as keyof typeof settings] ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TeamManagementSection() {
  const { isAdmin } = useAuth();
  const [team, setTeam] = useState(DEMO_TEAM);

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    if (!isAdmin) { toast.error('Admin role required'); return; }
    setTeam((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
    toast.success('Role updated');
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={14} className="text-cyan-400" />
            Team Management
          </CardTitle>
        </CardHeader>
        <div className="py-8 text-center">
          <Shield size={24} className="text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Admin role required to manage team</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users size={14} className="text-cyan-400" />
          Team Management
        </CardTitle>
        <span className="text-xs text-slate-500 font-mono">{team.length} members</span>
      </CardHeader>

      {/* Role descriptions */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {(['admin', 'analyst', 'viewer'] as UserRole[]).map((role) => (
          <div key={role} className={`p-2 rounded border ${ROLE_COLORS[role]}`}>
            <p className="text-[10px] font-mono font-bold uppercase mb-0.5">{role}</p>
            <p className="text-[9px] leading-relaxed" style={{ color: 'currentColor', opacity: 0.8 }}>
              {ROLE_DESCRIPTIONS[role].slice(0, 50)}...
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {team.map((member) => (
          <div key={member.id} className="flex items-center gap-3 p-3 rounded border border-cyan-500/10 hover:border-cyan-500/20 transition-colors">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm flex-shrink-0">
              {member.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200">{member.name}</p>
              <p className="text-xs text-slate-500">{member.email} • {member.department}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="success">Active</Badge>
              <select
                value={member.role}
                onChange={(e) => handleRoleChange(member.id, e.target.value as UserRole)}
                className="cyber-input text-xs w-24 py-1"
              >
                <option value="admin">Admin</option>
                <option value="analyst">Analyst</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const { isAdmin } = useAuth();

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={14} /> },
    { id: 'security', label: 'Security', icon: <Lock size={14} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={14} /> },
    ...(isAdmin ? [{ id: 'team', label: 'Team', icon: <Users size={14} /> }] : []),
  ];

  return (
    <div className="flex flex-col">
      <Header title="Settings" subtitle="Account, security & system configuration" />
      <div className="p-6 space-y-5">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-cyan-500/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-all border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="max-w-2xl">
          {activeTab === 'profile' && <ProfileSection />}
          {activeTab === 'security' && <SecuritySection />}
          {activeTab === 'notifications' && <NotificationsSection />}
          {activeTab === 'team' && <TeamManagementSection />}
        </div>
      </div>
    </div>
  );
}
