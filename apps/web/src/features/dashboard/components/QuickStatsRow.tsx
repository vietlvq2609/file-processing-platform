import { formatBytes } from '../../../utils/formatBytes';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { FileIcon, JobListIcon, StorageIcon } from '../icons';
import { StatCard } from './StatCard';

export function QuickStatsRow() {
  const { fileCount, jobCount, storageBytes } = useDashboardStats();

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
