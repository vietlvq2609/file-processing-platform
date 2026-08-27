import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Brand Panel - Hidden on mobile, 40% width on desktop */}
      <div className="hidden flex-col items-center justify-center bg-indigo-50 gap-8 px-8 py-12 md:flex md:w-2/5 lg:px-12">
        <NavLink to="/" className="flex flex-col items-center gap-8 no-underline">
          <img src="/images/logo.png" alt="Logo" className="w-36 h-36" />
          <div>
            <h1 className="text-3xl text-center mb-2">FileProc</h1>
            <p className="text-lg text-gray-600">Simple file processing platform</p>
          </div>
        </NavLink>
      </div>

      {/* Form Panel - Full width on mobile, 60% width on desktop */}
      <div className="flex w-full flex-col items-center justify-center px-4 py-8 md:w-3/5 md:px-0">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
