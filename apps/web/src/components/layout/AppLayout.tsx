import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { logout } from '../../api/auth';
import { useAuthStore } from '../../stores/authStore';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Files' },
  { to: '/converter', label: 'Converter' },
  { to: '/compressor', label: 'Compressor' },
  { to: '/tools', label: 'Tools' },
];

export default function AppLayout() {
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          height: 52,
          borderBottom: '1px solid #e2e8f0',
          background: '#fff',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 15, marginRight: 24, color: '#2d3748' }}>
            FileProc
          </span>
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#3182ce' : '#4a5568',
                textDecoration: 'none',
                background: isActive ? '#ebf8ff' : 'transparent',
              })}
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user && <span style={{ fontSize: 13, color: '#718096' }}>{user.email}</span>}
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
      </nav>

      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
}
