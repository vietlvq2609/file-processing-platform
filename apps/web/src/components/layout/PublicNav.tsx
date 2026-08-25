import { Link } from 'react-router-dom';

import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';

export function PublicNav() {
  const isAuthenticated = useAuthStore((s) => Boolean(s.accessToken));

  return (
    <nav className="sticky top-0 z-10 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-13 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="text-sm font-bold text-gray-800 no-underline">
          FileProc
        </Link>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Link to="/app/dashboard">
              <Button variant="primary" size="sm">
                Go to Dashboard →
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
