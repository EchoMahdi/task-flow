import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout/index';
import { 
  Card, CardContent, Button, TextField, Alert, Avatar, 
  Tabs, Divider, Box, Typography, Grid, FormControl, InputLabel, Select, MenuItem 
} from '@mui/material';
import PageHeader from '../components/ui/PageHeader';
import { Icons } from '../components/ui/Icons';
import { useAuth } from '../context/AuthContext';
import { preferenceService } from '../services/preferenceService';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import MapIcon from '@mui/icons-material/Map';
import LanguageIcon from '@mui/icons-material/Language';
import InfoIcon from '@mui/icons-material/Info';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);

  // Profile form - loaded from backend
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    phone: '',
    location: '',
    website: '',
    timezone: 'UTC',
  });

  // Load profile data from backend on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setProfileData({
          name: user.name || '',
          email: user.email || '',
          bio: user.profile?.bio || '',
          phone: user.profile?.phone || '',
          location: user.profile?.location || '',
          website: user.profile?.website || '',
          timezone: user.timezone || 'UTC',
        });
        setDataLoaded(true);
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError('Failed to load profile data.');
        setDataLoaded(true);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'password', label: 'Password' },
    { id: 'timezone', label: 'Timezone' },
  ];

  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
    { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
    { value: 'Asia/Tehran', label: 'Iran Standard Time (IRST)' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
  ];

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    setSuccess('');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // REAL API call to update profile
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await preferenceService.updateProfile({
        bio: profileData.bio,
        phone: profileData.phone,
        location: profileData.location,
        website: profileData.website,
      });
      
      await refreshUser();
      
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // REAL API call to change password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await preferenceService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      setSuccess('Password changed successfully! You may need to log in again.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Failed to change password:', err);
      setError(err.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // REAL API call to update timezone
  const handleTimezoneSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await preferenceService.updateProfile({
        timezone: profileData.timezone,
      });
      
      await refreshUser();
      
      setSuccess('Timezone updated successfully!');
    } catch (err) {
      console.error('Failed to update timezone:', err);
      setError(err.response?.data?.message || 'Failed to update timezone. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!dataLoaded) {
    return (
      <MainLayout>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <PageHeader
            title="Profile"
            description="Manage your account settings and preferences"
          />
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: 'grey.300' }} />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ height: 24, width: 128, bgcolor: 'grey.300', borderRadius: 1, mb: 1 }} />
                  <Box sx={{ height: 20, width: 192, bgcolor: 'grey.300', borderRadius: 1 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <PageHeader
          title="Profile"
          description="Manage your account settings and preferences"
        />

        {/* Success/Error Alerts */}
        {success && (
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Sidebar */}
          <Grid item xs={12} md={3}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                <Avatar 
                  name={profileData.name} 
                  sx={{ width: 80, height: 80, fontSize: '2rem' }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                >
                  <PhotoCameraIcon sx={{ fontSize: 16 }} />
                </Box>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {profileData.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {profileData.email}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ textAlign: 'left' }}>
                {profileData.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <MapIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {profileData.location}
                    </Typography>
                  </Box>
                )}
                {profileData.website && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LanguageIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography 
                      component="a"
                      href={profileData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="body2"
                      color="primary"
                      sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                      {profileData.website.replace('https://', '')}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={9}>
            <Card>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={activeTab} 
                  onChange={(_, value) => setActiveTab(value)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{ px: 3 }}
                >
                  {tabs.map((tab) => (
                    <Tab key={tab.id} label={tab.label} value={tab.id} />
                  ))}
                </Tabs>
              </Box>

              <CardContent>
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <form onSubmit={handleProfileSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Full Name"
                          name="name"
                          value={profileData.name}
                          onChange={handleProfileChange}
                          disabled
                          helperText="Contact support to change your name"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email Address"
                          name="email"
                          type="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          disabled
                          helperText="Contact support to change your email"
                        />
                      </Grid>
                    </Grid>

                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Bio"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      placeholder="Tell us about yourself..."
                    />

                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          placeholder="+1 (555) 000-0000"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Location"
                          name="location"
                          value={profileData.location}
                          onChange={handleProfileChange}
                          placeholder="City, Country"
                        />
                      </Grid>
                    </Grid>

                    <TextField
                      fullWidth
                      label="Website"
                      name="website"
                      value={profileData.website}
                      onChange={handleProfileChange}
                      placeholder="https://yourwebsite.com"
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button type="submit" variant="contained" disabled={loading}>
                        Save Changes
                      </Button>
                    </Box>
                  </form>
                )}

                {/* Password Tab */}
                {activeTab === 'password' && (
                  <form onSubmit={handlePasswordSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box 
                      sx={{ 
                        p: 3, 
                        bgcolor: 'warning.light', 
                        borderRadius: 2,
                        border: 1,
                        borderColor: 'warning.light',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2
                      }}
                    >
                      <WarningAmberIcon sx={{ color: 'warning.main', mt: 0.5 }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'warning.dark' }}>
                          Password Requirements
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'warning.dark', mt: 0.5 }}>
                          <ul style={{ margin: '4px 0 0 0', paddingLeft: 20 }}>
                            <li>At least 8 characters long</li>
                            <li>Include uppercase and lowercase letters</li>
                            <li>Include at least one number</li>
                          </ul>
                        </Typography>
                      </Box>
                    </Box>

                    <TextField
                      fullWidth
                      label="Current Password"
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter your current password"
                      error={!!passwordErrors.currentPassword}
                      helperText={passwordErrors.currentPassword}
                    />

                    <TextField
                      fullWidth
                      label="New Password"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter your new password"
                      error={!!passwordErrors.newPassword}
                      helperText={passwordErrors.newPassword}
                    />

                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm your new password"
                      error={!!passwordErrors.confirmPassword}
                      helperText={passwordErrors.confirmPassword}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button type="submit" variant="contained" disabled={loading}>
                        Change Password
                      </Button>
                    </Box>
                  </form>
                )}

                {/* Timezone Tab */}
                {activeTab === 'timezone' && (
                  <form onSubmit={handleTimezoneSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box 
                      sx={{ 
                        p: 3, 
                        bgcolor: 'primary.light', 
                        borderRadius: 2,
                        border: 1,
                        borderColor: 'primary.light',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2
                      }}
                    >
                      <InfoIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.dark' }}>
                          About Timezone Settings
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'primary.dark', mt: 0.5 }}>
                          Your timezone affects how due dates and reminders are displayed. 
                          Make sure to select the correct timezone for accurate notifications.
                        </Typography>
                      </Box>
                    </Box>

                    <FormControl fullWidth>
                      <InputLabel>Timezone</InputLabel>
                      <Select
                        name="timezone"
                        value={profileData.timezone}
                        onChange={handleProfileChange}
                        label="Timezone"
                      >
                        {timezones.map((tz) => (
                          <MenuItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        <Typography component="span" variant="body2" sx={{ fontWeight: 500 }}>
                          Current local time:
                        </Typography>{' '}
                        {new Date().toLocaleString('en-US', { timeZone: profileData.timezone })}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button type="submit" variant="contained" disabled={loading}>
                        Save Timezone
                      </Button>
                    </Box>
                  </form>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </MainLayout>
  );
};

export default Profile;
