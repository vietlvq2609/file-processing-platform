import FileUploadZone from '../features/files/components/FileUploadZone';
import FileList from '../features/files/components/FileList';

export default function DashboardPage() {
  return (
    <main style={{ maxWidth: 800, margin: '40px auto', padding: '0 16px' }}>
      <h1 style={{ marginTop: 0 }}>Files</h1>
      <FileUploadZone />
      <FileList />
    </main>
  );
}
