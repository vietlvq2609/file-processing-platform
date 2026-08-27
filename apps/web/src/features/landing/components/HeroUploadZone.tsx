import { Link } from 'react-router-dom';

import { Button } from '../../../components/ui/Button';
import { useGuestJob } from '../hooks/useGuestJob';
import { GuestCompressZone } from './GuestCompressZone';
import { GuestConvertZone } from './GuestConvertZone';

interface HeroUploadZoneProps {
  activeTab: 'convert' | 'compress';
}

// Skeleton placeholder keeps the hero height stable while the guest session loads.
const Skeleton = () => (
  <div className="min-h-45 animate-pulse rounded-lg border border-gray-200 bg-gray-50" />
);

export function HeroUploadZone({ activeTab }: HeroUploadZoneProps) {
  const { isSupported, isReady } = useGuestJob();

  if (isSupported && activeTab === 'convert') {
    if (!isReady) return <Skeleton />;
    return <GuestConvertZone />;
  }

  if (isSupported && activeTab === 'compress') {
    if (!isReady) return <Skeleton />;
    return <GuestCompressZone />;
  }

  // Fallback CTA for unsupported browsers.
  return (
    <div className="flex min-h-45 flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-8 py-10 text-center">
      <p className="text-base font-medium text-gray-700">
        {activeTab === 'convert'
          ? 'Convert your files in seconds.'
          : 'Compress your files instantly.'}
      </p>
      <p className="text-sm text-gray-500">
        No sign-up required — create a free account to get started.
      </p>
      <Link to="/register">
        <Button variant="primary" size="lg">
          Sign up free to process files →
        </Button>
      </Link>
    </div>
  );
}
