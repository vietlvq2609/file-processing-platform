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
    <div className="flex min-h-screen flex-col">
      <nav className="sticky top-0 z-10 flex h-[52px] items-center justify-between border-b border-gray-200 bg-white px-6">
        <div className="flex items-center gap-1">
          <span className="mr-6 text-sm font-bold text-gray-800">FileProc</span>
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-sm no-underline transition-colors ${
                  isActive
                    ? 'bg-blue-50 font-semibold text-blue-600'
                    : 'font-normal text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user && <span className="text-xs text-gray-500">{user.email}</span>}
          <button
            onClick={handleLogout}
            className="cursor-pointer rounded-md border border-gray-200 bg-white px-3.5 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
