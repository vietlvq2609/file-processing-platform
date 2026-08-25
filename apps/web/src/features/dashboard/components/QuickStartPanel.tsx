import { CompressIcon, ConvertIcon, GridIcon } from '../icons';
import { QuickStartCard } from './QuickStartCard';

export function QuickStartPanel() {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Quick Start</h2>
      <QuickStartCard icon={<ConvertIcon />} label="Convert a file" to="/app/convert" />
      <QuickStartCard icon={<CompressIcon />} label="Compress a file" to="/app/compress" />
      <QuickStartCard icon={<GridIcon />} label="See all tools" to="/app/tools" />
    </div>
  );
}
