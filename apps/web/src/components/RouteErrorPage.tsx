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
    <main style={{ maxWidth: 480, margin: '80px auto', padding: '0 16px', textAlign: 'center' }}>
      <p style={{ fontSize: 48, margin: '0 0 16px' }}>⚠️</p>
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>Something went wrong</h1>
      <p style={{ color: '#718096', marginBottom: 32 }}>{message}</p>
      <button
        onClick={() => navigate('/dashboard')}
        style={{ color: '#4299e1', background: 'none', border: 'none', cursor: 'pointer' }}
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
