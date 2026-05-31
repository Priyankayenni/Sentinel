import { useState } from 'react';
import { Key, Plus, Copy, Trash2, Eye, EyeOff, RefreshCw, X, Check, AlertTriangle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, generateId, timeAgo } from '@/lib/utils';
import { toast } from 'sonner';
import type { ApiKey } from '@/lib/database.types';

const PERMISSION_OPTIONS = [
  { id: 'read:alerts', label: 'Read Alerts', desc: 'View security alerts' },
  { id: 'write:alerts', label: 'Write Alerts', desc: 'Create/update alerts' },
  { id: 'read:scans', label: 'Read Scans', desc: 'View scan results' },
  { id: 'write:scans', label: 'Write Scans', desc: 'Trigger vulnerability scans' },
  { id: 'read:incidents', label: 'Read Incidents', desc: 'View incidents' },
  { id: 'write:incidents', label: 'Write Incidents', desc: 'Create/update incidents' },
  { id: 'read:reports', label: 'Read Reports', desc: 'Download generated reports' },
  { id: 'read:metrics', label: 'Read Metrics', desc: 'Access dashboard metrics' },
];

function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const arr = new Uint32Array(40);
  crypto.getRandomValues(arr);
  const key = Array.from(arr, (x) => chars[x % chars.length]).join('');
  return `stl_${key}`;
}

const DEMO_KEYS: (ApiKey & { full_key?: string })[] = [
  {
    id: 'key-001',
    user_id: 'demo-admin-id',
    name: 'CI/CD Pipeline Integration',
    key_prefix: 'stl_ci_p',
    key_hash: 'hashed',
    permissions: ['read:alerts', 'read:scans', 'write:scans'],
    is_active: true,
    last_used: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
  {
    id: 'key-002',
    user_id: 'demo-admin-id',
    name: 'SIEM Integration',
    key_prefix: 'stl_sm_p',
    key_hash: 'hashed',
    permissions: ['read:alerts', 'read:incidents', 'read:metrics'],
    is_active: true,
    last_used: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    expires_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: 'key-003',
    user_id: 'demo-admin-id',
    name: 'Monitoring Dashboard (Grafana)',
    key_prefix: 'stl_gr_p',
    key_hash: 'hashed',
    permissions: ['read:metrics'],
    is_active: false,
    last_used: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    expires_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
  },
];

function CreateKeyModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (key: ApiKey & { full_key: string }) => void;
}) {
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [expires, setExpires] = useState('90');

  const togglePermission = (perm: string) => {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleCreate = () => {
    if (!name.trim()) { toast.error('API key name required'); return; }
    if (permissions.length === 0) { toast.error('Select at least one permission'); return; }

    const fullKey = generateApiKey();
    const expiresAt = expires === 'never' ? null : new Date(Date.now() + Number(expires) * 86400000).toISOString();

    const newKey: ApiKey & { full_key: string } = {
      id: `key-${generateId()}`,
      user_id: 'demo-admin-id',
      name,
      key_prefix: fullKey.slice(0, 8),
      key_hash: 'hashed',
      permissions,
      is_active: true,
      last_used: null,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
      full_key: fullKey,
    };

    onCreate(newKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="cyber-card w-full max-w-lg border border-cyan-500/20">
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/10">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Plus size={14} className="text-cyan-400" />
            Create API Key
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-slate-400 uppercase font-mono mb-1.5">Key Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="cyber-input text-sm"
              placeholder="e.g., CI/CD Pipeline, SIEM Integration..."
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 uppercase font-mono mb-2">Permissions</label>
            <div className="grid grid-cols-2 gap-2">
              {PERMISSION_OPTIONS.map((perm) => (
                <label key={perm.id} className="flex items-start gap-2 cursor-pointer group p-2 rounded border border-transparent hover:border-cyan-500/15 transition-colors">
                  <div
                    onClick={() => togglePermission(perm.id)}
                    className={`w-4 h-4 rounded border flex items-center justify-center mt-0.5 transition-colors cursor-pointer flex-shrink-0 ${
                      permissions.includes(perm.id)
                        ? 'bg-cyan-500 border-cyan-400'
                        : 'bg-transparent border-slate-600 group-hover:border-slate-400'
                    }`}
                  >
                    {permissions.includes(perm.id) && <Check size={10} className="text-black" />}
                  </div>
                  <div>
                    <p className="text-xs text-slate-300">{perm.label}</p>
                    <p className="text-[10px] text-slate-500">{perm.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 uppercase font-mono mb-1.5">Expiration</label>
            <select
              value={expires}
              onChange={(e) => setExpires(e.target.value)}
              className="cyber-input text-sm"
            >
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days</option>
              <option value="365">1 year</option>
              <option value="never">Never expires</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="primary" onClick={handleCreate} icon={<Key size={13} />}>
              Generate Key
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewKeyDisplay({ apiKey, onClose }: { apiKey: ApiKey & { full_key: string }; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(apiKey.full_key);
    setCopied(true);
    toast.success('API key copied to clipboard');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="cyber-card w-full max-w-lg border border-green-500/30">
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check size={18} className="text-green-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-green-400">API Key Created!</h3>
              <p className="text-xs text-slate-500">Copy your key — it won't be shown again</p>
            </div>
          </div>

          <div className="p-3 rounded bg-black/40 border border-green-500/20">
            <code className="text-sm font-mono text-green-400 break-all">{apiKey.full_key}</code>
          </div>

          <div className="p-3 rounded bg-yellow-500/5 border border-yellow-500/20 flex items-start gap-2">
            <AlertTriangle size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-300">
              This key will only be displayed once. Copy it now and store it in a secure location.
              If you lose it, you'll need to generate a new one.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="success" onClick={handleCopy} icon={copied ? <Check size={13} /> : <Copy size={13} />}>
              {copied ? 'Copied!' : 'Copy Key'}
            </Button>
            <Button variant="ghost" onClick={onClose}>Done</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ApiKeys() {
  const [keys, setKeys] = useState(DEMO_KEYS);
  const [showCreate, setShowCreate] = useState(false);
  const [newKey, setNewKey] = useState<(ApiKey & { full_key: string }) | null>(null);
  const [showFull, setShowFull] = useState<Record<string, boolean>>({});

  const handleCreate = (key: ApiKey & { full_key: string }) => {
    setKeys((prev) => [key, ...prev]);
    setNewKey(key);
    toast.success('API key created');
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key?')) return;
    setKeys((prev) => prev.filter((k) => k.id !== id));
    toast.success('API key revoked');
  };

  const handleToggle = (id: string) => {
    setKeys((prev) => prev.map((k) => k.id === id ? { ...k, is_active: !k.is_active } : k));
    toast.success('API key status updated');
  };

  const handleCopy = async (prefix: string) => {
    await navigator.clipboard.writeText(`${prefix}...`);
    toast.success('Key prefix copied');
  };

  const isExpired = (key: ApiKey) => key.expires_at && new Date(key.expires_at) < new Date();

  return (
    <div className="flex flex-col">
      <Header title="API Keys" subtitle="Manage programmatic access credentials" />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Keys', value: keys.length, color: 'text-slate-300' },
            { label: 'Active', value: keys.filter((k) => k.is_active).length, color: 'text-green-400' },
            { label: 'Expired', value: keys.filter((k) => isExpired(k)).length, color: 'text-red-400' },
          ].map((stat) => (
            <div key={stat.label} className="cyber-card p-3 text-center">
              <p className={`text-xl font-black font-mono ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-slate-500 uppercase">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Create Button */}
        <div className="flex justify-end">
          <Button variant="primary" icon={<Plus size={13} />} onClick={() => setShowCreate(true)}>
            Create API Key
          </Button>
        </div>

        {/* Keys Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key size={14} className="text-cyan-400" />
              API Keys
            </CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {keys.map((key) => {
              const expired = isExpired(key);
              return (
                <div
                  key={key.id}
                  className={`p-4 rounded-lg border transition-all ${
                    !key.is_active || expired
                      ? 'border-slate-700/40 bg-slate-900/30 opacity-60'
                      : 'border-cyan-500/15 hover:border-cyan-500/25'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-sm font-semibold text-slate-200">{key.name}</p>
                        {key.is_active && !expired && <Badge variant="success">Active</Badge>}
                        {!key.is_active && <Badge variant="info">Disabled</Badge>}
                        {expired && <Badge variant="critical">Expired</Badge>}
                      </div>

                      {/* Key prefix */}
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-xs font-mono text-cyan-400 bg-cyan-500/5 px-2 py-0.5 rounded">
                          {showFull[key.id] ? key.key_prefix + '••••••••••••••••••••••••••••••••' : `${key.key_prefix}••••••••`}
                        </code>
                        <button
                          onClick={() => setShowFull((prev) => ({ ...prev, [key.id]: !prev[key.id] }))}
                          className="text-slate-600 hover:text-slate-400"
                        >
                          {showFull[key.id] ? <EyeOff size={11} /> : <Eye size={11} />}
                        </button>
                        <button
                          onClick={() => handleCopy(key.key_prefix)}
                          className="text-slate-600 hover:text-cyan-400"
                        >
                          <Copy size={11} />
                        </button>
                      </div>

                      {/* Permissions */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {key.permissions.map((perm) => (
                          <span key={perm} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                            {perm}
                          </span>
                        ))}
                      </div>

                      {/* Meta info */}
                      <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono">
                        <span>Created: {formatDate(key.created_at)}</span>
                        {key.last_used && <span>Last used: {timeAgo(key.last_used)}</span>}
                        {key.expires_at && (
                          <span className={expired ? 'text-red-400' : ''}>
                            {expired ? 'Expired' : 'Expires'}: {formatDate(key.expires_at)}
                          </span>
                        )}
                        {!key.expires_at && <span>Never expires</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleToggle(key.id)}
                        className={`w-8 h-4 rounded-full transition-colors relative ${key.is_active ? 'bg-cyan-500' : 'bg-slate-700'}`}
                        title={key.is_active ? 'Disable' : 'Enable'}
                      >
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${key.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                      <button
                        onClick={() => handleDelete(key.id)}
                        className="p-1 rounded hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-colors"
                        title="Revoke key"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Security Notice */}
        <div className="p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 flex items-start gap-3">
          <AlertTriangle size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-400 mb-1">API Key Security</p>
            <ul className="text-xs text-slate-400 space-y-0.5">
              <li>• API keys provide programmatic access — treat them like passwords</li>
              <li>• Never commit API keys to version control or share them in plain text</li>
              <li>• Use minimal permissions (principle of least privilege)</li>
              <li>• Rotate keys regularly and revoke unused ones immediately</li>
              <li>• Monitor key usage via the Activity Log for anomalous access</li>
            </ul>
          </div>
        </div>

        {/* API Docs Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw size={14} className="text-cyan-400" />
              Quick API Reference
            </CardTitle>
          </CardHeader>
          <div className="terminal text-[11px] space-y-3">
            <div>
              <span className="output-dim"># Authenticate</span>
              <br />
              <span>curl -H <span className="output-warning">"Authorization: Bearer stl_YOUR_KEY"</span></span>
              <br />
              <span className="text-cyan-400"> https://api.sentinel.io/v1/alerts</span>
            </div>
            <div>
              <span className="output-dim"># Get critical alerts</span>
              <br />
              <span>curl -H <span className="output-warning">"Authorization: Bearer stl_YOUR_KEY"</span> \</span>
              <br />
              <span className="text-cyan-400"> "https://api.sentinel.io/v1/alerts?severity=critical&status=open"</span>
            </div>
            <div>
              <span className="output-dim"># Trigger vulnerability scan</span>
              <br />
              <span>curl -X POST -H <span className="output-warning">"Authorization: Bearer stl_YOUR_KEY"</span> \</span>
              <br />
              <span> -d <span className="output-warning">'{`{"target":"example.com","type":"domain"}`}'</span> \</span>
              <br />
              <span className="text-cyan-400"> "https://api.sentinel.io/v1/scans"</span>
            </div>
          </div>
        </Card>
      </div>

      {showCreate && (
        <CreateKeyModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
      {newKey && (
        <NewKeyDisplay apiKey={newKey} onClose={() => setNewKey(null)} />
      )}
    </div>
  );
}
