import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'cyan' | 'red' | 'green' | 'none';
}

export function Card({ children, className, hover = false, glow = 'none' }: CardProps) {
  const glowClasses = {
    cyan: 'hover:border-cyan-400/30 hover:shadow-[0_0_20px_rgba(0,212,255,0.1)]',
    red: 'hover:border-red-400/30 hover:shadow-[0_0_20px_rgba(255,59,107,0.1)]',
    green: 'hover:border-green-400/30 hover:shadow-[0_0_20px_rgba(0,255,136,0.1)]',
    none: '',
  };

  return (
    <div
      className={cn(
        'cyber-card p-4',
        hover && 'transition-all duration-200',
        glow !== 'none' && glowClasses[glow],
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-sm font-semibold text-slate-200 uppercase tracking-wider', className)}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('', className)}>{children}</div>;
}
