import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { AuthLayout } from '@/components/layout/index';
import { 
  Button, 
  TextField, 
  Checkbox, 
  Alert, 
  Card, 
  CardContent, 
  Box, 
  Typography, 
  InputAdornment, 
  IconButton, 
  LinearProgress,
  CircularProgress 
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import { socialAuthService } from '@/services/socialAuthService';
import { initCsrf, authService } from '@/services/authService';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [socialLoading, setSocialLoading] = useState({});

  // Get redirect URL from query params
  const redirectTo = searchParams.get('redirect') || '/app/dashboard';

  // Check if already authenticated - redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  // Initialize CSRF on mount
  useEffect(() => {
    initCsrf();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = t('Name is required');
    } else if (formData.name.length < 2) {
      newErrors.name = t('Name must be at least 2 characters');
    }
    
    if (!formData.email) {
      newErrors.email = t('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('Please enter a valid email address');
    }
    
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
    
    if (!formData.terms) {
      newErrors.terms = t('You must accept the terms and conditions');
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
      await register(
        formData.name, 
        formData.email, 
        formData.password, 
        formData.password_confirmation
      );
      navigate(redirectTo);
    } catch (error) {
      const message = error.response?.data?.message || 
                      error.message || 
                      t('Registration failed. Please try again.');
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  // Handle social login (which doubles as registration)
  const handleSocialLogin = async (provider) => {
    setSocialLoading((prev) => ({ ...prev, [provider]: true }));
    setApiError('');

    try {
      const popup = await socialAuthService.loginWithProvider(provider);

      // Check if popup was blocked
      if (!popup || popup.closed) {
        throw new Error("Popup was blocked. Please allow popups for this site");
      }

      // Start polling for popup to close (indicates auth/registration completed)
      const popupCheckInterval = setInterval(async () => {
        if (popup.closed) {
          clearInterval(popupCheckInterval);
          
          // Initialize CSRF and check auth status
          await initCsrf();
          const user = await authService.getUser();
          if (user) {
            navigate(redirectTo, { replace: true });
          }
        }
      }, 500);
    } catch (error) {
      setApiError(error.message || t("Registration failed. Please try again"));
    } finally {
      setSocialLoading((prev) => ({ ...prev, [provider]: false }));
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

  return (
    <AuthLayout>
      <Box sx={{ width: '100%', maxWidth: 432, animation: 'fadeIn 0.3s ease-in-out' }}>
        <Card sx={{ boxShadow: 4 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                {t('Create your account')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('Start your productivity journey today')}
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

            {/* Email/Password Registration Form */}
            <form onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label={t('Full name')}
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('John Doe')}
                error={!!errors.name}
                helperText={errors.name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                autoComplete="name"
                autoFocus
                fullWidth
                disabled={loading}
              />

              <TextField
                label={t('Email address')}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('you@example.com')}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                autoComplete="email"
                fullWidth
                disabled={loading}
              />

              <Box>
                <TextField
                  label={t('Password')}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t('Min 8 characters')}
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
                  fullWidth
                  disabled={loading}
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
                label={t('Confirm password')}
                type={showPassword ? 'text' : 'password'}
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                placeholder={t('Confirm your password')}
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
                disabled={loading}
              />

              <Box>
                <Checkbox
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                  disabled={loading}
                />
                <Typography variant="body2" component="span" color="text.secondary">
                  {t('I agree to the')}{' '}
                  <Link to="#" style={{ color: '#1976d2', textDecoration: 'none' }}>
                    {t('Terms of Service')}
                  </Link>{' '}
                  {t('and')}
                  <Link to="#" style={{ color: '#1976d2', textDecoration: 'none' }}>
                    {t('Privacy Policy')}
                  </Link>
                </Typography>
                {errors.terms && (
                  <Typography variant="caption" color="error" sx={{ ml: 4, display: 'block' }}>
                    {errors.terms}
                  </Typography>
                )}
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{ py: 1.5, mt: 1 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : t('Create account')}
              </Button>
            </form>

            {/* Divider */}
            <Box sx={{ position: 'relative', my: 3 }}>
              <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%', borderTop: '1px solid', borderColor: 'divider' }} />
              </Box>
              <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <Typography variant="caption" sx={{ px: 2, bgcolor: 'background.paper', color: 'text.secondary' }}>
                  {t('Or sign up with')}
                </Typography>
              </Box>
            </Box>

            {/* Social Login */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <Button 
                variant="outlined" 
                type="button" 
                startIcon={socialLoading.google ? <CircularProgress size={18} /> : <GoogleIcon />}
                onClick={() => handleSocialLogin('google')}
                disabled={socialLoading.google}
              >
                {t('Google')}
              </Button>
              <Button 
                variant="outlined" 
                type="button" 
                startIcon={socialLoading.github ? <CircularProgress size={18} /> : <GitHubIcon />}
                onClick={() => handleSocialLogin('github')}
                disabled={socialLoading.github}
              >
                {t('GitHub')}
              </Button>
            </Box>

            {/* Sign in link */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {t('Already have an account?')}{' '}
                <Link
                  to="/app/login"
                  style={{ color: '#1976d2', fontWeight: 500, textDecoration: 'none' }}
                >
                  {t('Sign in')}
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </AuthLayout>
  );
};

export default Register;
