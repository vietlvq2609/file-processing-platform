interface ProgressBarProps {
  value: number;
  variant?: 'default' | 'success' | 'danger';
  animated?: boolean;
}

const variantClasses: Record<NonNullable<ProgressBarProps['variant']>, string> = {
  default: 'bg-brand',
  success: 'bg-success',
  danger: 'bg-danger',
};

export function ProgressBar({ value, variant = 'default', animated = false }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-gray-100"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-300 ease-in-out ${variantClasses[variant]} ${animated ? 'animate-pulse' : ''}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
