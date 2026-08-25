import { AxiosError } from 'axios';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { login } from '../../../api/auth';
import { useAuthStore } from '../../../stores/authStore';

interface ValidationErrors {
  email?: string;
  password?: string;
}

export function useLoginForm() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password]);

  const submit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const { data: user, accessToken } = await login(email, password);
      setAuth(accessToken, user);
      navigate('/app/dashboard', { replace: true });
    } catch (err) {
      const error = err as AxiosError;
      if (error.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, password, validateForm, setAuth, navigate]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    errors,
    isLoading,
    submit,
  };
}
