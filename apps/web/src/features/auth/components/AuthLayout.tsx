import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Brand Panel - Hidden on mobile, 40% width on desktop */}
      <div className="hidden flex-col justify-center bg-indigo-50 px-8 py-12 md:flex md:w-2/5 lg:px-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">FileProc</h1>
          <p className="text-base text-gray-600">Simple file processing platform</p>
        </div>
        <p className="mt-12 text-sm text-gray-500">
          Process files with ease. Upload, transform, and download in seconds.
        </p>
      </div>

      {/* Form Panel - Full width on mobile, 60% width on desktop */}
      <div className="flex w-full flex-col items-center justify-center px-4 py-8 md:w-3/5 md:px-0">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
