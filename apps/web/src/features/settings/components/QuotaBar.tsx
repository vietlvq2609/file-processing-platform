import { ProgressBar } from '../../../components/ui/ProgressBar';

interface QuotaBarProps {
  label: string;
  used: number;
  total: number;
  unit?: string;
}

function variantForPercent(pct: number): 'default' | 'warning' | 'danger' {
  if (pct > 90) return 'danger';
  if (pct > 70) return 'warning';
  return 'default';
}

export function QuotaBar({ label, used, total, unit }: QuotaBarProps) {
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-text-primary">{label}</span>
        <span className="text-text-secondary">
          {used.toLocaleString()} / {total.toLocaleString()}
          {unit ? ` ${unit}` : ''}
        </span>
      </div>
      <ProgressBar value={pct} variant={variantForPercent(pct)} />
    </div>
  );
}
