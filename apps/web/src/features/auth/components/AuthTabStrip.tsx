import { NavLink } from 'react-router-dom';

export function AuthTabStrip() {
  return (
    <div className="mb-8 flex border-b border-border">
      <NavLink
        to="/login"
        className={({ isActive }) =>
          `px-4 py-3 text-sm font-medium transition-colors ${
            isActive ? 'border-b-2 border-brand text-brand' : 'text-gray-600 hover:text-gray-900'
          }`
        }
      >
        Sign in
      </NavLink>
      <NavLink
        to="/register"
        className={({ isActive }) =>
          `px-4 py-3 text-sm font-medium transition-colors ${
            isActive ? 'border-b-2 border-brand text-brand' : 'text-gray-600 hover:text-gray-900'
          }`
        }
      >
        Sign up
      </NavLink>
    </div>
  );
}
