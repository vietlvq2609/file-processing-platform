import type { ReactNode } from 'react';

import { Card } from '../../../components/ui';
import { useCountUp } from '../hooks/useCountUp';

interface StatCardProps {
  label: string;
  /** Pass null while loading to show a dash placeholder. */
  value: number | null;
  icon: ReactNode;
  format?: (n: number) => string;
}

export function StatCard({ label, value, icon, format }: StatCardProps) {
  const animated = useCountUp(value);
  const displayValue = value === null ? '—' : format ? format(animated) : animated.toLocaleString();

  return (
    <Card className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="truncate text-3xl font-bold tracking-tight text-gray-900">{displayValue}</p>
        <p className="mt-1 text-sm text-gray-500">{label}</p>
      </div>
      <div className="shrink-0 text-gray-200 [&_svg]:h-8 [&_svg]:w-8">{icon}</div>
    </Card>
  );
}
