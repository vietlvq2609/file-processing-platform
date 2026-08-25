import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { logout } from '../../api/auth';
import { useAuthStore } from '../../stores/authStore';

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

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
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex cursor-pointer items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
      >
        <span className="max-w-[150px] truncate">{user?.email}</span>
        <span className="text-gray-400">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
          <Link
            to="/app/files"
            className="block px-4 py-2.5 text-sm text-gray-700 no-underline hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            My Files
          </Link>
          <Link
            to="/app/settings"
            className="block px-4 py-2.5 text-sm text-gray-700 no-underline hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>
          <div className="border-t border-gray-100" />
          <button
            onClick={handleLogout}
            className="block w-full cursor-pointer border-none bg-transparent px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
