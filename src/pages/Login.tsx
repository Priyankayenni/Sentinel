import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Cpu, Shield, Lock, Mail, AlertCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function Login() {
  const navigate = useNavigate();
  const { signIn, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [terminalLines, setTerminalLines] = useState<string[]>([]);

  // Terminal animation on mount
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
      return;
    }
    const lines = [
      '> Initializing SENTINEL Security Operations Center...',
      '> Loading threat intelligence database...',
      '> Establishing secure connection [TLS 1.3]...',
      '> Running integrity checks...',
      '> Authentication module ready.',
      '> Awaiting credentials...',
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < lines.length) {
        setTerminalLines((prev) => [...prev, lines[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 350);
    return () => clearInterval(interval);
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await signIn(email, password);
    if (authError) {
      setError(authError);
      toast.error('Authentication Failed', { description: authError });
    } else {
      toast.success('Access Granted', { description: 'Welcome to SENTINEL' });
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const demoAccounts = [
    { email: 'admin@sentinel.io', password: 'Admin@123', role: 'ADMIN', color: 'text-red-400' },
    { email: 'analyst@sentinel.io', password: 'Analyst@123', role: 'ANALYST', color: 'text-yellow-400' },
    { email: 'viewer@sentinel.io', password: 'Viewer@123', role: 'VIEWER', color: 'text-blue-400' },
  ];

  const lineColors: Record<number, string> = {
    0: 'output-success',
    1: 'output-dim',
    2: 'output-dim',
    3: 'output-dim',
    4: 'output-success',
    5: 'text-cyan-400',
  };

  return (
    <div className="min-h-screen bg-[#050a0f] cyber-grid flex items-center justify-center p-4">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/3 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* Left — Terminal */}
        <div className="hidden md:flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <Cpu size={24} className="text-cyan-400" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full status-online" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-cyan-400 font-mono tracking-widest text-glow-cyan">
                SENTINEL
              </h1>
              <p className="text-xs text-slate-500 font-mono">CYBER SECURITY OPERATIONS CENTER</p>
            </div>
          </div>

          {/* Terminal Output */}
          <div className="terminal flex-1 min-h-[200px]">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-cyan-500/10">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="text-slate-600 text-xs ml-2">sentinel-auth v1.0.0</span>
            </div>
            {terminalLines.map((line, i) => (
              <span key={i} className={`output-line ${lineColors[i] ?? ''}`}>
                {line}
              </span>
            ))}
            {terminalLines.length > 0 && (
              <span className="output-line">
                <span className="text-cyan-400">$</span>
                <span className="blink">█</span>
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'THREATS', value: '1,247', color: 'text-red-400' },
              { label: 'BLOCKED', value: '98.2%', color: 'text-green-400' },
              { label: 'ASSETS', value: '847', color: 'text-cyan-400' },
            ].map((stat) => (
              <div key={stat.label} className="cyber-card p-3 text-center">
                <p className={`text-lg font-bold font-mono ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] text-slate-500 font-mono">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Demo Accounts */}
          <div className="cyber-card p-3">
            <p className="text-[10px] text-slate-500 font-mono uppercase mb-2">Demo Accounts</p>
            <div className="space-y-1">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  onClick={() => { setEmail(acc.email); setPassword(acc.password); }}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-cyan-500/5 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold ${acc.color}`}>[{acc.role}]</span>
                    <span className="text-xs text-slate-400">{acc.email}</span>
                  </div>
                  <ChevronRight size={12} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Login Form */}
        <div className="cyber-card p-6 flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={16} className="text-cyan-400" />
              <h2 className="text-sm font-semibold text-slate-300 font-mono uppercase tracking-wider">
                Secure Authentication
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Enter your credentials to access the Security Operations Center
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="cyber-input pl-8"
                  placeholder="operator@sentinel.io"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="cyber-input pl-8 pr-10"
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 justify-center text-sm font-semibold"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield size={14} />
                  ACCESS SENTINEL
                </>
              )}
            </button>
          </form>

          {/* Mobile Demo Links */}
          <div className="md:hidden border-t border-cyan-500/10 pt-4">
            <p className="text-[10px] text-slate-500 font-mono mb-2">Quick Login:</p>
            <div className="flex gap-2 flex-wrap">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  onClick={() => { setEmail(acc.email); setPassword(acc.password); }}
                  className={`text-[10px] font-mono border rounded px-2 py-1 ${acc.color} border-current/30 hover:bg-current/10`}
                >
                  {acc.role}
                </button>
              ))}
            </div>
          </div>

          <div className="text-center">
            <p className="text-[10px] text-slate-600 font-mono">
              ⚡ SENTINEL v1.0.0 | AES-256 Encrypted | SOC2 Type II
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
