import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../components/layout/index';
import { Button, Input, Alert, Card, CardBody } from '../components/ui/index';
import { Icons } from '../components/ui/Icons';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (!formData.password_confirmation) {
      newErrors.password_confirmation = 'Please confirm your password';
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
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
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
    } catch (error) {
      setApiError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    const levels = [
      { strength: 1, label: 'Weak', color: 'bg-danger-500' },
      { strength: 2, label: 'Fair', color: 'bg-warning-500' },
      { strength: 3, label: 'Good', color: 'bg-warning-400' },
      { strength: 4, label: 'Strong', color: 'bg-success-500' },
      { strength: 5, label: 'Very Strong', color: 'bg-success-600' },
    ];
    
    return levels[strength - 1] || { strength: 0, label: '', color: '' };
  };

  const passwordStrength = getPasswordStrength();

  // Invalid token state
  if (!token) {
    return (
      <AuthLayout>
        <div className="w-full max-w-md animate-fade-in">
          <Card className="shadow-elevated">
            <CardBody className="p-8 text-center">
              <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icons.ExclamationCircle className="w-8 h-8 text-danger-600" />
              </div>
              <h1 className="text-2xl font-bold text-secondary-900 mb-2">
                Invalid Reset Link
              </h1>
              <p className="text-secondary-500 mb-6">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Link to="/forgot-password">
                <Button fullWidth>
                  Request New Link
                </Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </AuthLayout>
    );
  }

  // Success state
  if (success) {
    return (
      <AuthLayout>
        <div className="w-full max-w-md animate-fade-in">
          <Card className="shadow-elevated">
            <CardBody className="p-8 text-center">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icons.CheckCircle className="w-8 h-8 text-success-600" />
              </div>
              <h1 className="text-2xl font-bold text-secondary-900 mb-2">
                Password Reset Successful
              </h1>
              <p className="text-secondary-500 mb-6">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
              <Link to="/login">
                <Button fullWidth>
                  Sign in
                </Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md animate-fade-in">
        <Card className="shadow-elevated">
          <CardBody className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icons.Lock className="w-8 h-8 text-primary-600" />
              </div>
              <h1 className="text-2xl font-bold text-secondary-900 mb-2">
                Set new password
              </h1>
              <p className="text-secondary-500">
                Your new password must be different from previously used passwords.
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
              <div>
                <Input
                  label="New password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  error={errors.password}
                  icon={<Icons.Lock className="w-5 h-5" />}
                  autoComplete="new-password"
                  autoFocus
                />
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-secondary-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all duration-300`}
                          style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-secondary-500">{passwordStrength.label}</span>
                    </div>
                  </div>
                )}
              </div>

              <Input
                label="Confirm new password"
                type={showPassword ? 'text' : 'password'}
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                placeholder="••••••••"
                error={errors.password_confirmation}
                icon={<Icons.Lock className="w-5 h-5" />}
                autoComplete="new-password"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-secondary-500 hover:text-secondary-700 flex items-center gap-1"
              >
                {showPassword ? (
                  <>
                    <Icons.EyeSlash className="w-4 h-4" />
                    Hide passwords
                  </>
                ) : (
                  <>
                    <Icons.Eye className="w-4 h-4" />
                    Show passwords
                  </>
                )}
              </button>

              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                Reset password
              </Button>
            </form>

            {/* Back to login */}
            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-secondary-500 hover:text-secondary-700"
              >
                <Icons.ArrowLeft className="w-4 h-4 mr-2" />
                Back to sign in
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
