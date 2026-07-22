import { useParams } from 'react-router-dom';

/**
 * Reads a route param by name and guarantees a non-empty string.
 * Throws if the param is absent so the caller always receives `string`,
 * eliminating the need for `id ?? ''` or `enabled: Boolean(id)` fallbacks.
 *
 * Usage:
 *   const id = useRequiredParam('id');
 */
export function useRequiredParam(name: string): string {
  const params = useParams();
  const value = params[name];

  if (!value) {
    throw new Error(
      `Route param ":${name}" is missing. Make sure this component is rendered inside a route that defines ":${name}".`
    );
  }

  return value;
}
