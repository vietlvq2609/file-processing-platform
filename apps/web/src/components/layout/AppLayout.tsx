import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { NavJobsBadge } from './NavJobsBadge';
import { UserMenu } from './UserMenu';

const TOOL_LINKS = [
  { to: '/app/convert', label: 'Convert' },
  { to: '/app/compress', label: 'Compress' },
  { to: '/app/tools', label: 'Tools' },
];

const BASE_LINK_CLASS =
  'rounded-md px-3 py-1.5 text-sm no-underline transition-colors font-normal text-gray-600 hover:bg-gray-100';
const ACTIVE_LINK_CLASS =
  'rounded-md px-3 py-1.5 text-sm no-underline transition-colors font-semibold';
const ACTIVE_STYLE = { color: 'var(--color-brand)', backgroundColor: 'var(--color-brand-light)' };

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? ACTIVE_LINK_CLASS : BASE_LINK_CLASS;
}

function navStyle({ isActive }: { isActive: boolean }) {
  return isActive ? ACTIVE_STYLE : {};
}

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <nav className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="flex h-13 items-center justify-between px-6">
          {/* Left cluster: brand + tool links */}
          <div className="flex items-center gap-1">
            <NavLink
              to="/app/dashboard"
              className="mr-4 text-sm font-bold text-gray-800 no-underline"
            >
              <div className="flex items-center">
                <img src="/images/logo.png" alt="Logo" className="w-8 h-8" />
                <span className="ml-2">FileProc</span>
              </div>
            </NavLink>
            <div className="hidden items-center gap-1 md:flex">
              {TOOL_LINKS.map(({ to, label }) => (
                <NavLink key={to} to={to} className={navClass} style={navStyle}>
                  {label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Right cluster: jobs badge + user menu + mobile hamburger */}
          <div className="flex items-center gap-3">
            <NavJobsBadge />
            <UserMenu />
            <button
              className="cursor-pointer border-none bg-transparent p-1 text-lg text-gray-600 md:hidden"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle navigation"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile expanded menu */}
        {menuOpen && (
          <div className="border-t border-gray-100 px-6 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {TOOL_LINKS.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={navClass}
                  style={navStyle}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
