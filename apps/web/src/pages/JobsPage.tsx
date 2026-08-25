import { JobList } from '../features/jobs/components/JobList';
import { JobsFilterTabs } from '../features/jobs/components/JobsFilterTabs';
import { useJobsPageState } from '../features/jobs/hooks/useJobsPageState';

export default function JobsPage() {
  const { status, page, setStatus, setPage } = useJobsPageState();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Jobs</h1>
      <JobsFilterTabs activeStatus={status} onSelect={setStatus} />
      <div className="mt-4">
        <JobList status={status} page={page} onPageChange={setPage} />
      </div>
    </main>
  );
}
