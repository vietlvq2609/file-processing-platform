import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { login } from '../api/auth';
import { useAuthStore } from '../stores/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const { data: user, accessToken } = await login(email, password);
      setAuth(accessToken, user);
      navigate('/app/dashboard', { replace: true });
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-lg bg-white px-8 py-10 shadow-sm">
        <h1 className="mb-2 text-xl font-bold text-gray-900">File Processing Platform</h1>
        <p className="mb-7 text-sm text-gray-500">Sign in to your account</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
              className="block w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm outline-none"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="block w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm outline-none"
            />
          </div>

          {error && (
            <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`block w-full rounded-md border-none px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ${
              isLoading
                ? 'cursor-not-allowed bg-gray-400'
                : 'cursor-pointer bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Dev credentials: test@example.com / password123
        </p>
      </div>
    </div>
  );
}
