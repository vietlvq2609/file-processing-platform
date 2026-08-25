import { Card } from '../../../components/ui/Card';

const STEPS = [
  {
    number: '1',
    heading: 'Drop your file',
    body: 'Drag and drop or click to upload. We support images, PDFs, videos, and more.',
  },
  {
    number: '2',
    heading: 'Choose an operation',
    body: 'Convert formats, compress size, or apply transformations.',
  },
  {
    number: '3',
    heading: 'Download instantly',
    body: 'Your processed file is ready in seconds. No account needed.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="bg-gray-50 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-10 text-center text-2xl font-bold text-gray-900">How it works</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map(({ number, heading, body }) => (
            <Card key={number} className="text-center">
              <div
                className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white"
                style={{ backgroundColor: 'var(--color-brand)' }}
              >
                {number}
              </div>
              <h3 className="mb-2 text-base font-semibold text-gray-900">{heading}</h3>
              <p className="text-sm text-gray-600">{body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
