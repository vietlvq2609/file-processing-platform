type Tab = 'profile' | 'usage' | 'api-keys';

interface SettingsSidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'usage', label: 'Usage' },
  { id: 'api-keys', label: 'API Keys' },
];

export function SettingsSidebar({ activeTab, onTabChange }: SettingsSidebarProps) {
  return (
    <nav aria-label="Settings navigation">
      {/* Desktop: vertical sidebar; Mobile: horizontal strip */}
      <ul className="flex flex-row gap-1 md:flex-col">
        {tabs.map((tab) => (
          <li key={tab.id}>
            <button
              onClick={() => onTabChange(tab.id)}
              className={`w-full rounded-lg px-4 py-2 text-left text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-brand-light text-brand'
                  : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export type { Tab };
