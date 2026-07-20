import { useNavigate } from 'react-router-dom';
import FileUploadZone from '../features/files/components/FileUploadZone';
import FileList from '../features/files/components/FileList';
import { logout } from '../api/auth';
import { useAuthStore } from '../stores/authStore';

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // Proceed even if the server call fails.
    }
    clearAuth();
    navigate('/login', { replace: true });
  }

  return (
    <main style={{ maxWidth: 800, margin: '40px auto', padding: '0 16px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <h1 style={{ margin: 0 }}>Files</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user && (
            <span style={{ fontSize: 13, color: '#718096' }}>{user.email}</span>
          )}
          <button
            onClick={handleLogout}
            style={{
              padding: '6px 14px',
              fontSize: 13,
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              cursor: 'pointer',
              color: '#4a5568',
            }}
          >
            Sign out
          </button>
        </div>
      </div>
      <FileUploadZone />
      <FileList />
    </main>
  );
}
