import { useDocumentTitle } from '../../../hooks/useDocumentTitle';

export default function ToolsPage() {
  useDocumentTitle('Tools — FileProc');
  return (
    <main className="mx-auto mt-10 max-w-3xl px-4">
      <h1 className="mt-0">Tools</h1>
      <p className="text-gray-500">Coming soon — miscellaneous file utilities.</p>
    </main>
  );
}
