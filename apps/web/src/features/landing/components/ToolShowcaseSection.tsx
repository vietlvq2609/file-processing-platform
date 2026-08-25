import { Link } from 'react-router-dom';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

const TOOLS = [
  { icon: '🖼️', name: 'Convert Images', description: 'PNG, JPG, WebP, SVG and more.' },
  { icon: '📄', name: 'Compress PDF', description: 'Reduce PDF size without quality loss.' },
  { icon: '🎬', name: 'Resize Video', description: 'Scale or crop video to any resolution.' },
  { icon: '🎵', name: 'Convert Audio', description: 'MP3, WAV, OGG, FLAC — any format.' },
];

export function ToolShowcaseSection() {
  return (
    <section className="bg-white px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-10 text-center text-2xl font-bold text-gray-900">What you can do</h2>
        <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
          {TOOLS.map(({ icon, name, description }) => (
            <Card key={name} className="flex flex-col items-center text-center">
              <span className="mb-3 text-4xl" role="img" aria-label={name}>
                {icon}
              </span>
              <h3 className="mb-1 text-sm font-semibold text-gray-900">{name}</h3>
              <p className="mb-4 flex-1 text-xs text-gray-500">{description}</p>
              <Link to="/register">
                <Button variant="secondary" size="sm">
                  Try it →
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
