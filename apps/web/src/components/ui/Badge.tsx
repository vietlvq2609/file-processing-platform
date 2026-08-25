import type { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  children: ReactNode;
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, { dot: string; pill: string }> = {
  default: { dot: 'bg-gray-400', pill: 'bg-gray-100 text-gray-600' },
  success: { dot: 'bg-success', pill: 'bg-green-50 text-green-700' },
  warning: { dot: 'bg-warning', pill: 'bg-amber-50 text-amber-700' },
  danger: { dot: 'bg-danger', pill: 'bg-red-50 text-red-700' },
  info: { dot: 'bg-brand', pill: 'bg-brand-light text-brand' },
};

export function Badge({ variant = 'default', children }: BadgeProps) {
  const { dot, pill } = variantClasses[variant];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {children}
    </span>
  );
}
