import { useState } from 'react';

import { ApiKeysTab } from '../features/settings/components/ApiKeysTab';
import { ProfileTab } from '../features/settings/components/ProfileTab';
import type { Tab } from '../features/settings/components/SettingsSidebar';
import { SettingsSidebar } from '../features/settings/components/SettingsSidebar';
import { UsageTab } from '../features/settings/components/UsageTab';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold text-text-primary">Settings</h1>

      <div className="flex flex-col gap-6 md:flex-row">
        {/* Sidebar / tab strip */}
        <aside className="md:w-44 md:shrink-0">
          <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </aside>

        {/* Tab content */}
        <div className="min-w-0 flex-1">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'usage' && <UsageTab />}
          {activeTab === 'api-keys' && <ApiKeysTab />}
        </div>
      </div>
    </main>
  );
}
