import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthLayout } from '../features/auth/components/AuthLayout';
import { AuthTabStrip } from '../features/auth/components/AuthTabStrip';
import { RegisterForm } from '../features/auth/components/RegisterForm';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useAuthStore } from '../stores/authStore';

export default function RegisterPage() {
  useDocumentTitle('Create account — FileProc');
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (accessToken) {
      navigate('/app/dashboard', { replace: true });
    }
  }, [accessToken, navigate]);

  return (
    <AuthLayout>
      <AuthTabStrip />
      <RegisterForm />
    </AuthLayout>
  );
}
