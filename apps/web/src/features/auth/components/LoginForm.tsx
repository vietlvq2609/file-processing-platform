import { FormEvent } from 'react';

import { Button, Card, Input } from '../../../components/ui';
import { useLoginForm } from '../hooks/useLoginForm';

export function LoginForm() {
  const { email, setEmail, password, setPassword, error, errors, isLoading, submit } =
    useLoginForm();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await submit();
  }

  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
        <p className="mt-1 text-sm text-gray-600">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          id="login-email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          disabled={isLoading}
          autoComplete="email"
        />

        <Input
          id="login-password"
          type="password"
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          disabled={isLoading}
          autoComplete="current-password"
        />

        {error && (
          <div className="rounded-md border border-danger bg-danger/5 px-3 py-2.5 text-sm text-danger">
            {error}
          </div>
        )}

        <Button type="submit" variant="primary" isLoading={isLoading} className="w-full">
          Sign in
        </Button>
      </form>
    </Card>
  );
}
