interface FormatSelectorProps {
  formats: string[];
  value: string;
  onChange: (fmt: string) => void;
}

export function FormatSelector({ formats, value, onChange }: FormatSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {formats.map((fmt) => (
        <button
          key={fmt}
          type="button"
          onClick={() => onChange(fmt)}
          className={[
            'rounded-md border px-4 py-1.5 text-sm font-medium transition-colors',
            value === fmt
              ? 'border-indigo-600 bg-indigo-600 text-white'
              : 'border-gray-300 bg-white text-gray-700 hover:border-indigo-400 hover:text-indigo-600',
          ].join(' ')}
        >
          {fmt}
        </button>
      ))}
    </div>
  );
}
