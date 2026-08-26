import { ProgressBar } from '../../../components/ui';
import { formatBytes } from '../../../utils/formatBytes';

interface SizeComparisonProps {
  originalSize: number;
  outputSize: number;
}

export function SizeComparison({ originalSize, outputSize }: SizeComparisonProps) {
  const reductionPct = Math.round((1 - outputSize / originalSize) * 100);
  const reduced = reductionPct > 0;

  return (
    <div className="space-y-3 rounded-md bg-gray-50 px-4 py-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Before</span>
        <span className="font-medium text-gray-800">{formatBytes(originalSize)}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">After</span>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-800">{formatBytes(outputSize)}</span>
          {reduced ? (
            <span className="text-xs font-semibold text-green-600">↓ {reductionPct}% smaller</span>
          ) : (
            <span className="text-xs text-gray-400">No reduction achieved</span>
          )}
        </div>
      </div>
      {reduced && <ProgressBar value={reductionPct} variant="default" animated={false} />}
    </div>
  );
}
