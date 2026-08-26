import { Skeleton } from '../../../components/ui';
import { formatBytes } from '../../../utils/formatBytes';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { FileIcon, JobListIcon, StorageIcon } from '../icons';
import { StatCard } from './StatCard';

export function QuickStatsRow() {
  const { fileCount, jobCount, storageBytes, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton height={36} className="w-1/2" />
              <Skeleton height={14} className="w-2/3" />
            </div>
            <Skeleton height={32} width={32} className="rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard label="Files Uploaded" value={fileCount} icon={<FileIcon />} />
      <StatCard label="Jobs Run" value={jobCount} icon={<JobListIcon />} />
      <StatCard
        label="Storage Used"
        value={storageBytes}
        icon={<StorageIcon />}
        format={formatBytes}
      />
    </div>
  );
}
