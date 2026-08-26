import { CompressFlow } from '../components/CompressFlow';

export default function CompressorPage() {
  return (
    <main className="mx-auto mt-10 max-w-3xl px-4">
      <h1 className="mt-0">Compress</h1>
      <p className="mb-6 text-gray-500">Reduce file size for images, PDFs, and videos.</p>
      <CompressFlow />
    </main>
  );
}
