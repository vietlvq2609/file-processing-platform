import { Outlet } from 'react-router-dom';

import { PublicNav } from './PublicNav';

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
