import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-[0_1px_4px_rgba(0,0,0,.06)] ${className}`}
    >
      {children}
    </div>
  );
}
