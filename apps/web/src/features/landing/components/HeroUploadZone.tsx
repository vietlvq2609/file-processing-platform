import { Link } from 'react-router-dom';

import { Button } from '../../../components/ui/Button';
import { useGuestJob } from '../hooks/useGuestJob';
import { GuestConvertZone } from './GuestConvertZone';

interface HeroUploadZoneProps {
  activeTab: 'convert' | 'compress';
}

export function HeroUploadZone({ activeTab }: HeroUploadZoneProps) {
  const { isSupported, isReady } = useGuestJob();

  if (isSupported && activeTab === 'convert') {
    if (!isReady) {
      // Skeleton placeholder keeps the hero height stable while the guest session loads.
      return (
        <div className="min-h-45 animate-pulse rounded-lg border border-gray-200 bg-gray-50" />
      );
    }
    return <GuestConvertZone />;
  }

  // Fallback CTA for the Compress tab (not yet implemented for guests) or unsupported browsers.
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
