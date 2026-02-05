import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/I18nContext';
import { AuthLayout } from '../components/layout/index';
import { Button, Input, Checkbox, Alert, Card, CardBody } from '../components/ui/index';
import { Icons } from '../components/ui/Icons';
import { socialAuthService } from '../services/socialAuthService';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [socialLoading, setSocialLoading] = useState({});

  // Popup reference for social login
  const popupRef = useRef(null);
  const popupCheckInterval = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = t('validation.required', { attribute: t('common.email') });
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('validation.email', { attribute: t('common.email') });
    }

    if (!formData.password) {
      newErrors.password = t('validation.required', { attribute: t('common.password') });
    } else if (formData.password.length < 6) {
      newErrors.password = t('validation.min.string', { attribute: t('common.password'), min: 6 });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setApiError('');

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error) {
      setApiError(error.message || t('auth.login.failed'));
    } finally {
      setLoading(false);
    }
  };

  // Handle social login
  const handleSocialLogin = async (provider) => {
    setSocialLoading((prev) => ({ ...prev, [provider]: true }));
    setApiError('');

    try {
      const popup = await socialAuthService.loginWithProvider(provider);
      popupRef.current = popup;

      // Check if popup was blocked
      if (!popup || popup.closed) {
        throw new Error('Popup was blocked. Please allow popups for this site.');
      }

      // Start polling for popup to close (indicates auth completed)
      popupCheckInterval.current = setInterval(() => {
        if (popup.closed) {
          clearInterval(popupCheckInterval.current);
          popupCheckInterval.current = null;
          popupRef.current = null;
          // Check if user is now logged in
          checkAuthStatus();
        }
      }, 500);

    } catch (error) {
      setApiError(error.message || t('auth.login.failed'));
    } finally {
      setSocialLoading((prev) => ({ ...prev, [provider]: false }));
    }
  };

  // Check if user is authenticated after social login
  const checkAuthStatus = async () => {
    try {
      const user = await useAuth.getState().getUser();
      if (user) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (popupCheckInterval.current) {
        clearInterval(popupCheckInterval.current);
      }
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    };
  }, []);

  return (
    <AuthLayout>
      <div className="w-full max-w-md animate-fade-in">
        <Card className="shadow-elevated">
          <CardBody className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-secondary-900 mb-2">
                {t('auth.login.title')}
              </h1>
              <p className="text-secondary-500">
                {t('auth.login.subtitle')}
              </p>
            </div>

            {/* Error Alert */}
            {apiError && (
              <Alert
                variant="danger"
                className="mb-6"
                icon={<Icons.ExclamationCircle className="w-5 h-5" />}
                onClose={() => setApiError('')}
              >
                {apiError}
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label={t('common.email')}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                error={errors.email}
                icon={<Icons.Mail className="w-5 h-5" />}
                autoComplete="email"
                autoFocus
              />

              <div>
                <Input
                  label={t('common.password')}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  error={errors.password}
                  icon={<Icons.Lock className="w-5 h-5" />}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="mt-1 text-xs text-secondary-500 hover:text-secondary-700 flex items-center gap-1"
                >
                  {showPassword ? (
                    <>
                      <Icons.EyeSlash className="w-4 h-4" />
                      {t('auth.login.hide_password')}
                    </>
                  ) : (
                    <>
                      <Icons.Eye className="w-4 h-4" />
                      {t('auth.login.show_password')}
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <Checkbox
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  label={t('common.remember_me')}
                />
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  {t('common.forgot_password')}
                </Link>
              </div>

              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                {t('common.login')}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-secondary-500">{t('auth.login.or_continue')}</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={socialLoading.google}
                loading={socialLoading.google}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => handleSocialLogin('github')}
                disabled={socialLoading.github}
                loading={socialLoading.github}
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </Button>
            </div>

            {/* Sign up link */}
            <p className="mt-8 text-center text-sm text-secondary-500">
              {t('auth.login.no_account')}{' '}
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                {t('auth.login.sign_up_link')}
              </Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </AuthLayout>
  );
};

export default Login;
