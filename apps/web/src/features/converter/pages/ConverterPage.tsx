import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { ConvertFlow } from '../components/ConvertFlow';

export default function ConverterPage() {
  useDocumentTitle('Convert — FileProc');
  return (
    <main className="mx-auto mt-10 max-w-3xl px-4">
      <h1 className="mt-0 mb-6">Convert</h1>
      <ConvertFlow />
    </main>
  );
}
