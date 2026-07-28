import { useJobWebSocket } from '../../../hooks/useJobWebSocket';
import { getDownloadUrl } from '../../../api/files';
import type { Job } from '../../../types/domain';

interface JobProgressPanelProps {
  job: Job;
}

const STATUS_LABEL: Record<Job['status'], string> = {
  pending: 'Queued',
  active: 'Processing…',
  completed: 'Completed',
  failed: 'Failed',
};

const STATUS_COLOR: Record<Job['status'], string> = {
  pending: '#718096',
  active: '#3182ce',
  completed: '#38a169',
  failed: '#e53e3e',
};

const BAR_COLOR: Record<Job['status'], string> = {
  pending: '#a0aec0',
  active: '#3182ce',
  completed: '#38a169',
  failed: '#e53e3e',
};

export default function JobProgressPanel({ job }: JobProgressPanelProps) {
  const { progress, status, error } = useJobWebSocket(job.id, {
    progress: job.progress,
    status: job.status,
  });

  return (
    <div
      style={{
        marginTop: 24,
        padding: '16px 20px',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        background: '#f7fafc',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 14 }}>Processing job</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: STATUS_COLOR[status],
          }}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>

      {/* Progress bar track */}
      <div
        style={{
          height: 8,
          background: '#e2e8f0',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: BAR_COLOR[status],
            borderRadius: 4,
            transition: 'width 0.35s ease',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 6,
          fontSize: 12,
          color: '#718096',
        }}
      >
        <span>{progress}%</span>
        <span style={{ fontFamily: 'monospace', fontSize: 11 }}>job {job.id.slice(0, 8)}…</span>
      </div>

      {error && (
        <p style={{ color: '#e53e3e', fontSize: 13, marginTop: 10, marginBottom: 0 }}>{error}</p>
      )}

      {status === 'completed' && (
        <div style={{ marginTop: 14 }}>
          <a
            href={getDownloadUrl(job.fileId)}
            download
            style={{
              display: 'inline-block',
              padding: '6px 16px',
              background: '#38a169',
              color: '#fff',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Download result
          </a>
        </div>
      )}
    </div>
  );
}
