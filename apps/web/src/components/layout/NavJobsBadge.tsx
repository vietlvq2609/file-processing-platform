import { Link } from 'react-router-dom';

import { useJobs } from '../../features/jobs/hooks/useJobs';

export function NavJobsBadge() {
  const { data } = useJobs({ status: 'active', limit: 100 });
  const count = data?.data.length ?? 0;

  if (count === 0) return null;

  return (
    <Link
      to="/app/jobs"
      className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 no-underline hover:bg-gray-100"
    >
      Jobs
      <span
        className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white"
        style={{ backgroundColor: 'var(--color-brand)' }}
      >
        {count}
      </span>
    </Link>
  );
}
