import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/index';
import { useTranslation } from '@/context/I18nContext';
import { Button, TextField, Alert, Card, CardContent, Box, Typography, InputAdornment, IconButton, LinearProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const { t } = useTranslation();

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
      newErrors.password = t('Password is required');
    } else if (formData.password.length < 8) {
      newErrors.password = t('Password must be at least 8 characters');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = t('Password must contain uppercase, lowercase, and number');
    }
    
    if (!formData.password_confirmation) {
      newErrors.password_confirmation = t('Please confirm your password');
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = t('Passwords do not match');
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
      setApiError(error.message || t('Failed to reset password. Please try again.'));
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
      { strength: 1, label: t('Weak'), color: '#ef4444' },
      { strength: 2, label: t('Fair'), color: '#f97316' },
      { strength: 3, label: t('Good'), color: '#eab308' },
      { strength: 4, label: t('Strong'), color: '#22c55e' },
      { strength: 5, label: t('Very Strong'), color: '#15803d' },
    ];
    
    return levels[strength - 1] || { strength: 0, label: '', color: '' };
  };

  const passwordStrength = getPasswordStrength();

  // Invalid token state
  if (!token) {
    return (
      <AuthLayout>
        <Box sx={{ width: '100%', maxWidth: 432, animation: 'fadeIn 0.3s ease-in-out' }}>
          <Card sx={{ boxShadow: 4 }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Box sx={{ 
                width: 64, 
                height: 64, 
                borderRadius: '50%', 
                bgcolor: 'error.light', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 3
              }}>
                <ErrorIcon sx={{ fontSize: 32, color: 'error.main' }} />
              </Box>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                {t('Invalid Reset Link')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t('This password reset link is invalid or has expired. Please request a new one.')}
              </Typography>
              <Link to="/forgot-password">
                <Button variant="contained" fullWidth>
                  {t('Request New Link')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </Box>
      </AuthLayout>
    );
  }

  // Success state
  if (success) {
    return (
      <AuthLayout>
        <Box sx={{ width: '100%', maxWidth: 432, animation: 'fadeIn 0.3s ease-in-out' }}>
          <Card sx={{ boxShadow: 4 }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Box sx={{ 
                width: 64, 
                height: 64, 
                borderRadius: '50%', 
                bgcolor: 'success.light', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 3
              }}>
                <CheckCircleIcon sx={{ fontSize: 32, color: 'success.main' }} />
              </Box>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                {t('Password Reset Successful')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t('Your password has been successfully reset. You can now sign in with your new password.')}
              </Typography>
              <Link to="/login">
                <Button variant="contained" fullWidth>
                  {t('Sign in')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </Box>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Box sx={{ width: '100%', maxWidth: 432, animation: 'fadeIn 0.3s ease-in-out' }}>
        <Card sx={{ boxShadow: 4 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{ 
                width: 64, 
                height: 64, 
                borderRadius: '50%', 
                bgcolor: 'primary.light', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 3
              }}>
                <LockIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              </Box>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                {t('Set new password')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('Your new password must be different from previously used passwords.')}
              </Typography>
            </Box>

            {/* Error Alert */}
            {apiError && (
              <Alert 
                severity="error" 
                sx={{ mb: 3 }}
                onClose={() => setApiError('')}
              >
                {apiError}
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <TextField
                  label={t('New password')}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t('••••••••')}
                  error={!!errors.password}
                  helperText={errors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  autoComplete="new-password"
                  autoFocus
                  fullWidth
                />
                {formData.password && (
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(passwordStrength.strength / 5) * 100}
                        sx={{ 
                          flex: 1, 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: passwordStrength.color
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {passwordStrength.label}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>

              <TextField
                label={t('Confirm new password')}
                type={showPassword ? 'text' : 'password'}
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                placeholder={t('••••••••')}
                error={!!errors.password_confirmation}
                helperText={errors.password_confirmation}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                autoComplete="new-password"
                fullWidth
              />

              <Box>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? t('Hide passwords') : t('Show passwords')}
                </Typography>
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
              >
                {t('Reset password')}
              </Button>
            </form>

            {/* Back to login */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Link
                to="/login"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  fontSize: '0.875rem', 
                  color: '#65676b', 
                  textDecoration: 'none' 
                }}
              >
                <ArrowBackIcon sx={{ fontSize: 16, mr: 0.5 }} />
                {t('Back to sign in')}
              </Link>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </AuthLayout>
  );
};

export default ResetPassword;
