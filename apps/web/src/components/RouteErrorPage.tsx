import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';

import { Button } from './ui';

/**
 * Rendered by React Router whenever a route's render tree throws.
 * Covers both expected throws (e.g. useRequiredParam) and unexpected errors.
 *
 * Placed at two levels:
 *   - Root route  → global catch-all fallback
 *   - /files/:id  → same component; React Router picks the closest one first
 */
export default function RouteErrorPage() {
  const error = useRouteError();
  const is404 = isRouteErrorResponse(error) && error.status === 404;
  const message = resolveMessage(error);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="mb-4 text-6xl font-bold tracking-tight text-gray-100">
        {is404 ? '404' : '500'}
      </p>
      <h1 className="mb-3 font-sans text-xl font-semibold text-text-primary">
        {is404 ? 'Page not found' : 'Something went wrong'}
      </h1>
      <p className="mb-8 max-w-sm text-sm text-text-secondary">{message}</p>
      <Link to="/app/dashboard">
        <Button variant="secondary">Go to Dashboard</Button>
      </Link>
    </main>
  );
}

function resolveMessage(error: unknown): string {
  if (isRouteErrorResponse(error)) {
    return error.status === 404
      ? "The page you're looking for doesn't exist."
      : `Unexpected error (${error.status}).`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}
