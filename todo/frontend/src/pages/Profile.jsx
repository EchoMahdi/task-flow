import React, { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '../components/layout/index';
import { Card, CardBody, Button, Input, Textarea, Select, Alert, Avatar, Tabs, PageHeader, Divider } from '../components/ui/index';
import { Icons } from '../components/ui/Icons';
import { useAuth } from '../context/AuthContext';
import { preferenceService } from '../services/preferenceService';

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
    { id: 'profile', label: 'Profile', icon: <Icons.User className="w-4 h-4" /> },
    { id: 'password', label: 'Password', icon: <Icons.Lock className="w-4 h-4" /> },
    { id: 'timezone', label: 'Timezone', icon: <Icons.Globe className="w-4 h-4" /> },
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
    setSuccess(''); // Clear previous success messages
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
      // Update profile on backend - send profile fields directly (not double-wrapped)
      await preferenceService.updateProfile({
        bio: profileData.bio,
        phone: profileData.phone,
        location: profileData.location,
        website: profileData.website,
      });
      
      // Refresh user data to get updated profile
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
      // Make real API call to change password
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
      // Update user timezone on backend
      await preferenceService.updateProfile({
        timezone: profileData.timezone,
      });
      
      // Refresh user data
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
        <div className="max-w-4xl mx-auto">
          <PageHeader
            title="Profile"
            description="Manage your account settings and preferences"
          />
          <div className="animate-pulse space-y-6">
            <Card>
              <CardBody>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-secondary-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-6 bg-secondary-200 rounded w-32"></div>
                    <div className="h-4 bg-secondary-200 rounded w-48"></div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Profile"
          description="Manage your account settings and preferences"
        />

        {/* Success/Error Alerts */}
        {success && (
          <Alert
            variant="success"
            className="mb-6"
            icon={<Icons.CheckCircle className="w-5 h-5" />}
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}
        {error && (
          <Alert
            variant="danger"
            className="mb-6"
            icon={<Icons.ExclamationCircle className="w-5 h-5" />}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 text-center">
              <div className="relative inline-block mb-4">
                <Avatar name={profileData.name} size="xl" />
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
                  <Icons.Photo className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-semibold text-secondary-900">{profileData.name}</h3>
              <p className="text-sm text-secondary-500">{profileData.email}</p>
              <Divider />
              <div className="text-left space-y-3">
                {profileData.location && (
                  <div className="flex items-center gap-2 text-sm text-secondary-600">
                    <Icons.Map className="w-4 h-4 text-secondary-400" />
                    {profileData.location}
                  </div>
                )}
                {profileData.website && (
                  <div className="flex items-center gap-2 text-sm text-secondary-600">
                    <Icons.Globe className="w-4 h-4 text-secondary-400" />
                    <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline truncate">
                      {profileData.website.replace('https://', '')}
                    </a>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <div className="border-b border-secondary-200">
                <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="px-6" />
              </div>

              <CardBody>
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Full Name"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        placeholder="Your full name"
                        disabled
                        helper="Contact support to change your name"
                      />
                      <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        placeholder="your@email.com"
                        disabled
                        helper="Contact support to change your email"
                      />
                    </div>

                    <Textarea
                      label="Bio"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Phone Number"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        placeholder="+1 (555) 000-0000"
                      />
                      <Input
                        label="Location"
                        name="location"
                        value={profileData.location}
                        onChange={handleProfileChange}
                        placeholder="City, Country"
                      />
                    </div>

                    <Input
                      label="Website"
                      name="website"
                      value={profileData.website}
                      onChange={handleProfileChange}
                      placeholder="https://yourwebsite.com"
                    />

                    <div className="flex justify-end">
                      <Button type="submit" loading={loading}>
                        Save Changes
                      </Button>
                    </div>
                  </form>
                )}

                {/* Password Tab */}
                {activeTab === 'password' && (
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <Icons.ExclamationTriangle className="w-5 h-5 text-warning-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-warning-800">Password Requirements</h4>
                          <ul className="text-sm text-warning-700 mt-1 list-disc list-inside">
                            <li>At least 8 characters long</li>
                            <li>Include uppercase and lowercase letters</li>
                            <li>Include at least one number</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <Input
                      label="Current Password"
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter your current password"
                      error={passwordErrors.currentPassword}
                    />

                    <Input
                      label="New Password"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter your new password"
                      error={passwordErrors.newPassword}
                    />

                    <Input
                      label="Confirm New Password"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm your new password"
                      error={passwordErrors.confirmPassword}
                    />

                    <div className="flex justify-end">
                      <Button type="submit" loading={loading}>
                        Change Password
                      </Button>
                    </div>
                  </form>
                )}

                {/* Timezone Tab */}
                {activeTab === 'timezone' && (
                  <form onSubmit={handleTimezoneSubmit} className="space-y-6">
                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <Icons.InformationCircle className="w-5 h-5 text-primary-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-primary-800">About Timezone Settings</h4>
                          <p className="text-sm text-primary-700 mt-1">
                            Your timezone affects how due dates and reminders are displayed. 
                            Make sure to select the correct timezone for accurate notifications.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Select
                      label="Timezone"
                      name="timezone"
                      value={profileData.timezone}
                      onChange={handleProfileChange}
                      options={timezones}
                    />

                    <div className="p-4 bg-secondary-50 rounded-lg">
                      <p className="text-sm text-secondary-600">
                        <span className="font-medium">Current local time:</span>{' '}
                        {new Date().toLocaleString('en-US', { timeZone: profileData.timezone })}
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" loading={loading}>
                        Save Timezone
                      </Button>
                    </div>
                  </form>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
