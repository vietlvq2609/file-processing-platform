import FileList from '../features/files/components/FileList';
import FileUploadZone from '../features/files/components/FileUploadZone';

export default function FilesPage() {
  return (
    <main className="mx-auto mt-10 max-w-3xl px-4">
      <h1 className="mt-0">Files</h1>
      <FileUploadZone />
      <FileList />
    </main>
  );
}
