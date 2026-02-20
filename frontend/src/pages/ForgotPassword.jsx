import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/index';
import { useTranslation } from '@/context/I18nContext';
import { Button, TextField, Alert, Card, CardContent, Box, Typography, InputAdornment } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyIcon from '@mui/icons-material/Key';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { authService, initCsrf } from '@/services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { t } = useTranslation();

  // Initialize CSRF on mount
  useEffect(() => {
    initCsrf();
  }, []);

  const validate = () => {
    if (!email) {
      setError(t('Email is required'));
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t('Please enter a valid email address'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validate()) return;
    
    setLoading(true);
    
    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      const message = err.response?.data?.message || err.message || t('Failed to send reset link. Please try again');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

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
                {t('Check your email')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t("We've sent a password reset link to")}{' '}
                <Typography component="span" variant="body2" sx={{ fontWeight: 500 }}>
                  {email}
                </Typography>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Didn't receive the email? Check your spam folder or{' '}
                <Typography 
                  component="span" 
                  variant="body2" 
                  color="primary" 
                  sx={{ cursor: 'pointer', fontWeight: 500 }}
                  onClick={() => setSuccess(false)}
                >
                  try again
                </Typography>
              </Typography>
              <Link to="/app/login">
                <Button variant="outlined" fullWidth startIcon={<ArrowBackIcon />}>
                  {t('Back to sign in')}
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
                <KeyIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              </Box>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                {t('Forgot your password?')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("No worries, we'll send you reset instructions")}
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 3 }}
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label={t('Email address')}
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder={t('you@example.com')}
                error={!!error}
                helperText={error}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                autoComplete="email"
                autoFocus
                fullWidth
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
              >
                {t('Send reset link')}
              </Button>
            </form>

            {/* Back to login */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Link
                to="/app/login"
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

export default ForgotPassword;
