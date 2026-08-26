const PRESETS = [
  { label: 'Low', value: 40 },
  { label: 'Balanced', value: 70 },
  { label: 'High', value: 90 },
] as const;

interface QualitySliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function QualitySlider({ value, onChange }: QualitySliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="quality-slider" className="text-sm font-medium text-gray-700">
          Quality
        </label>
        <span className="text-sm font-semibold text-indigo-600">{value}%</span>
      </div>

      <input
        id="quality-slider"
        type="range"
        min={1}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-indigo-600"
      />

      <div className="flex gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onChange(preset.value)}
            className={`flex-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
              value === preset.value
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-gray-300 bg-white text-gray-600 hover:border-indigo-400 hover:text-indigo-600'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
