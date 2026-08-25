import type { JobStatus } from '../../../types/domain';

interface Tab {
  label: string;
  value: JobStatus | undefined;
}

const TABS: Tab[] = [
  { label: 'All', value: undefined },
  { label: 'Processing', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
];

interface JobsFilterTabsProps {
  activeStatus: JobStatus | undefined;
  onSelect: (status: JobStatus | undefined) => void;
}

export function JobsFilterTabs({ activeStatus, onSelect }: JobsFilterTabsProps) {
  return (
    <div className="flex gap-1 border-b border-gray-200" role="tablist">
      {TABS.map((tab) => {
        const isActive = tab.value === activeStatus;
        return (
          <button
            key={tab.label}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(tab.value)}
            className={`-mb-px px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive ? 'border-b-2 border-brand text-brand' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
