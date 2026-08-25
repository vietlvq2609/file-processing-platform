import { FormEvent } from 'react';

import { Button, Card, Input } from '../../../components/ui';
import { useRegisterForm } from '../hooks/useRegisterForm';

export function RegisterForm() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    errors,
    isLoading,
    showSuccess,
    submit,
  } = useRegisterForm();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await submit();
  }

  if (showSuccess) {
    return (
      <Card>
        <div className="text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Account created!</h3>
          <p className="mt-1 text-sm text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create account</h2>
        <p className="mt-1 text-sm text-gray-600">Sign up to get started</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          id="register-email"
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
          id="register-password"
          type="password"
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          disabled={isLoading}
          autoComplete="new-password"
        />

        <Input
          id="register-confirm-password"
          type="password"
          label="Confirm password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          disabled={isLoading}
          autoComplete="new-password"
        />

        {error && (
          <div className="rounded-md border border-danger bg-danger/5 px-3 py-2.5 text-sm text-danger">
            {error}
          </div>
        )}

        <Button type="submit" variant="primary" isLoading={isLoading} className="w-full">
          Create account
        </Button>
      </form>
    </Card>
  );
}
