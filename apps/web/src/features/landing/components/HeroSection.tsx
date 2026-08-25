import { useState } from 'react';

import { HeroUploadZone } from './HeroUploadZone';

type Tool = 'convert' | 'compress';

const TABS: { id: Tool; label: string }[] = [
  { id: 'convert', label: 'Convert' },
  { id: 'compress', label: 'Compress' },
];

export function HeroSection() {
  const [activeTab, setActiveTab] = useState<Tool>('convert');

  return (
    <section className="bg-white px-6 py-16 text-center">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
          Process any file. <span style={{ color: 'var(--color-brand)' }}>Instantly.</span>
        </h1>
        <p className="mb-2 text-lg text-gray-600">
          Convert, compress, and transform files in seconds.
        </p>
        <p className="mb-8 text-sm font-semibold" style={{ color: 'var(--color-brand)' }}>
          No sign-up required.
        </p>

        {/* Tool tab strip */}
        <div className="mb-4 inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`rounded-md px-5 py-1.5 text-sm font-semibold transition-colors ${
                activeTab === id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'bg-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <HeroUploadZone activeTab={activeTab} />
      </div>
    </section>
  );
}
