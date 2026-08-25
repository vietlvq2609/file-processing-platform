import { Link } from 'react-router-dom';

import { Button } from '../../../components/ui/Button';

export function SignupCtaSection() {
  return (
    <section className="px-6 py-16" style={{ backgroundColor: 'var(--color-brand-light)' }}>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="mb-3 text-2xl font-bold text-gray-900">Want to save your history?</h2>
        <p className="mb-8 text-gray-600">
          Create a free account and track every file you&apos;ve processed.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/login?mode=register">
            <Button variant="primary" size="lg">
              Create free account
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg">
              Sign in
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
