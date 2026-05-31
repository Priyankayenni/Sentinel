import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getRiskColor(score: number): string {
  if (score >= 80) return 'text-red-400';
  if (score >= 60) return 'text-orange-400';
  if (score >= 40) return 'text-yellow-400';
  return 'text-green-400';
}

export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    critical: 'text-red-400 bg-red-400/10 border-red-400/30',
    high: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
    medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    low: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    info: 'text-slate-400 bg-slate-400/10 border-slate-400/30',
  };
  return colors[severity] || colors.info;
}

export function getSeverityBadgeColor(severity: string): string {
  const colors: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400 border border-red-500/40',
    high: 'bg-orange-500/20 text-orange-400 border border-orange-500/40',
    medium: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
    low: 'bg-blue-500/20 text-blue-400 border border-blue-500/40',
    info: 'bg-slate-500/20 text-slate-400 border border-slate-500/40',
  };
  return colors[severity] || colors.info;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    open: 'bg-red-500/20 text-red-400 border border-red-500/40',
    investigating: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
    in_progress: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
    resolved: 'bg-green-500/20 text-green-400 border border-green-500/40',
    closed: 'bg-slate-500/20 text-slate-400 border border-slate-500/40',
    false_positive: 'bg-slate-500/20 text-slate-400 border border-slate-500/40',
    online: 'bg-green-500/20 text-green-400 border border-green-500/40',
    offline: 'bg-red-500/20 text-red-400 border border-red-500/40',
    degraded: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
    maintenance: 'bg-blue-500/20 text-blue-400 border border-blue-500/40',
  };
  return colors[status] || 'bg-slate-500/20 text-slate-400 border border-slate-500/40';
}

export function cvssToSeverity(score: number): string {
  if (score >= 9.0) return 'critical';
  if (score >= 7.0) return 'high';
  if (score >= 4.0) return 'medium';
  if (score >= 0.1) return 'low';
  return 'info';
}

export function hashString(str: string): string {
  // Simple SHA-1-like prefix generation for HIBP (demo only)
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(40, '0').slice(0, 40);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
