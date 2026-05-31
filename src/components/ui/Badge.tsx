import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'critical' | 'high' | 'medium' | 'low' | 'info' | 'success' | 'warning';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-slate-800 text-slate-300 border border-slate-700',
    critical: 'badge-critical',
    high: 'badge-high',
    medium: 'badge-medium',
    low: 'badge-low',
    info: 'badge-info',
    success: 'bg-green-500/15 text-green-400 border border-green-500/30',
    warning: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium font-mono',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const variant = severity as BadgeProps['variant'];
  const labels: Record<string, string> = {
    critical: '⬤ CRITICAL',
    high: '⬤ HIGH',
    medium: '⬤ MEDIUM',
    low: '⬤ LOW',
    info: '⬤ INFO',
  };
  return <Badge variant={variant}>{labels[severity] ?? severity.toUpperCase()}</Badge>;
}

export function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    open: { label: 'OPEN', variant: 'critical' },
    investigating: { label: 'INVESTIGATING', variant: 'warning' },
    in_progress: { label: 'IN PROGRESS', variant: 'warning' },
    resolved: { label: 'RESOLVED', variant: 'success' },
    closed: { label: 'CLOSED', variant: 'info' },
    false_positive: { label: 'FALSE POSITIVE', variant: 'info' },
    online: { label: 'ONLINE', variant: 'success' },
    offline: { label: 'OFFLINE', variant: 'critical' },
    degraded: { label: 'DEGRADED', variant: 'warning' },
    maintenance: { label: 'MAINTENANCE', variant: 'low' },
    completed: { label: 'COMPLETED', variant: 'success' },
    running: { label: 'RUNNING', variant: 'warning' },
    queued: { label: 'QUEUED', variant: 'info' },
    failed: { label: 'FAILED', variant: 'critical' },
  };
  const config = statusConfig[status] ?? { label: status.toUpperCase(), variant: 'default' as BadgeProps['variant'] };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
