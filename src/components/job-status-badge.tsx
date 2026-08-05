'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type JobStatusBadgeProps = {
  status: string;
  graceDaysRemaining?: number;
  className?: string;
};

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  active: { label: 'Active', classes: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  archived: { label: 'Archived', classes: 'bg-slate-100 text-slate-600 border-slate-200' },
  draft: { label: 'Draft', classes: 'bg-blue-100 text-blue-700 border-blue-200' },
  closed: { label: 'Closed', classes: 'bg-red-100 text-red-700 border-red-200' },
  paused: { label: 'Paused', classes: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  expired_warning: { label: 'Plan Expired', classes: 'bg-orange-100 text-orange-700 border-orange-200' },
};

export function JobStatusBadge({ status, graceDaysRemaining, className }: JobStatusBadgeProps) {
  // Show "Plan Expired" badge on active jobs when in grace period
  const key = graceDaysRemaining !== undefined && status === 'active' ? 'expired_warning' : status;
  const config = STATUS_CONFIG[key] || STATUS_CONFIG['active'];

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <Badge
        variant="secondary"
        className={cn('text-[10px] font-bold border w-fit', config.classes)}
      >
        {config.label}
      </Badge>
      {graceDaysRemaining !== undefined && status === 'active' && (
        <span className="text-[10px] text-orange-600 font-semibold">
          Archives in {graceDaysRemaining}d
        </span>
      )}
    </div>
  );
}
