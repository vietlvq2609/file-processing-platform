import { AxiosError } from 'axios';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { register } from '../../../api/auth';
import { useAuthStore } from '../../../stores/authStore';

interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function useRegisterForm() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password, confirmPassword]);

  const submit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const { data: user, accessToken } = await register(email, password);
      setShowSuccess(true);
      // Brief pause to show success message
      setTimeout(() => {
        setAuth(accessToken, user);
        navigate('/app/dashboard', { replace: true });
      }, 1000);
    } catch (err) {
      const error = err as AxiosError;
      if (error.response?.status === 409) {
        setError('An account with this email already exists.');
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
    confirmPassword,
    setConfirmPassword,
    error,
    errors,
    isLoading,
    showSuccess,
    submit,
  };
}
