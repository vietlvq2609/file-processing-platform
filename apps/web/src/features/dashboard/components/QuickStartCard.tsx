import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { Card } from '../../../components/ui';
import { ChevronRightIcon } from '../icons';

interface QuickStartCardProps {
  icon: ReactNode;
  label: string;
  to: string;
}

export function QuickStartCard({ icon, label, to }: QuickStartCardProps) {
  return (
    <Link to={to} className="no-underline">
      <Card className="flex cursor-pointer items-center gap-3 p-4 transition-colors hover:border-brand">
        <div className="text-brand [&_svg]:h-5 [&_svg]:w-5">{icon}</div>
        <span className="flex-1 text-sm font-medium text-gray-700">{label}</span>
        <ChevronRightIcon className="h-4 w-4 text-gray-400" />
      </Card>
    </Link>
  );
}
