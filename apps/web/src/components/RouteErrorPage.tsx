import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';

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
  const navigate = useNavigate();

  const message = resolveMessage(error);

  return (
    <main className="mx-auto mt-20 max-w-md px-4 text-center">
      <p className="mb-4 text-5xl">⚠️</p>
      <h1 className="mb-2 text-xl font-semibold">Something went wrong</h1>
      <p className="mb-8 text-gray-500">{message}</p>
      <button
        onClick={() => navigate('/dashboard')}
        className="cursor-pointer border-none bg-transparent text-blue-500"
      >
        ← Back to dashboard
      </button>
    </main>
  );
}

function resolveMessage(error: unknown): string {
  // React Router 404 / method-not-allowed responses
  if (isRouteErrorResponse(error)) {
    return error.status === 404 ? 'Page not found.' : `Unexpected error (${error.status}).`;
  }
  // Expected throws from hooks like useRequiredParam
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}
