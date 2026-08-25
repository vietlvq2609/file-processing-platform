import { QuickStartPanel } from '../features/dashboard/components/QuickStartPanel';
import { QuickStatsRow } from '../features/dashboard/components/QuickStatsRow';
import { RecentJobsFeed } from '../features/dashboard/components/RecentJobsFeed';

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <QuickStatsRow />

      {/*
       * DOM order: Quick Start first so mobile stacks Stats → Quick Start → Jobs.
       * On md+ a 5-column grid repositions Quick Start to the right column.
       */}
      <div className="mt-6 grid gap-6 md:grid-cols-5">
        <div className="md:col-span-2 md:col-start-4 md:row-start-1">
          <QuickStartPanel />
        </div>
        <div className="md:col-span-3 md:col-start-1 md:row-start-1">
          <RecentJobsFeed />
        </div>
      </div>
    </main>
  );
}
