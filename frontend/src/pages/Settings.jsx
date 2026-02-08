import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/index';
import {
  Card, CardContent, Button, Switch, Alert,
  Box, Typography, FormControl, InputLabel, Select, MenuItem,
  Divider, Container
} from '@mui/material';
import PageHeader from '../components/ui/PageHeader';
import DescriptionIcon from '@mui/icons-material/Description';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { preferenceService } from '../services/preferenceService';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { useTheme } from '../theme/ThemeProvider';

const Settings = () => {
  const { user, refreshUser } = useAuth();
  const { t, changeLanguage } = useI18n();
  const theme = useTheme();
  const colors = theme.colors || { background: { tertiary: '#f4f4f5' }, action: { hover: 'rgba(0, 0, 0, 0.04)' } };
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);

  // Notification settings - loaded from backend
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: true,
    dailyDigest: false,
    weeklyReport: true,
    marketingEmails: false,
  });

  // App preferences - loaded from backend
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    calendarType: 'gregorian',
    dateFormat: 'm/d/Y',
    timeFormat: 'h:i A',
    startOfWeek: 1,
    defaultTaskView: 'list',
    showWeekNumbers: false,
  });

  // Map backend date format to frontend display value
  const getDateFormatValue = (backendFormat) => {
    const mapping = {
      'Y-m-d': 'YYYY-MM-DD',
      'm/d/Y': 'MM/DD/YYYY',
      'd/m/Y': 'DD/MM/YYYY',
      'd.m.Y': 'DD.MM.YYYY',
    };
    return mapping[backendFormat] || 'MM/DD/YYYY';
  };

  // Map frontend display value to backend date format
  const getBackendDateFormat = (frontendValue) => {
    const mapping = {
      'YYYY-MM-DD': 'Y-m-d',
      'MM/DD/YYYY': 'm/d/Y',
      'DD/MM/YYYY': 'd/m/Y',
      'DD.MM.YYYY': 'd.m.Y',
    };
    return mapping[frontendValue] || 'm/d/Y';
  };

  // Map backend time format to frontend display value
  const getTimeFormatValue = (backendFormat) => {
    const mapping = {
      'H:i': '24h',
      'h:i A': '12h',
    };
    return mapping[backendFormat] || '12h';
  };

  // Map frontend display value to backend time format
  const getBackendTimeFormat = (frontendValue) => {
    const mapping = {
      '24h': 'H:i',
      '12h': 'h:i A',
    };
    return mapping[frontendValue] || 'h:i A';
  };

  // Fetch preferences from backend on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const prefs = await preferenceService.getPreferences();
        
        if (prefs) {
          setNotifications({
            emailNotifications: prefs.email_notifications ?? true,
            pushNotifications: prefs.push_notifications ?? true,
            taskReminders: prefs.task_reminders ?? true,
            dailyDigest: prefs.daily_digest ?? false,
            weeklyReport: prefs.weekly_report ?? true,
            marketingEmails: prefs.marketing_emails ?? false,
          });
          
          setPreferences({
            theme: prefs.theme ?? 'light',
            language: prefs.language ?? 'en',
            calendarType: prefs.calendar_type ?? 'gregorian',
            dateFormat: getDateFormatValue(prefs.date_format),
            timeFormat: getTimeFormatValue(prefs.time_format),
            startOfWeek: prefs.start_of_week === 0 ? 'sunday' : (prefs.start_of_week === 6 ? 'saturday' : 'monday'),
            defaultTaskView: prefs.default_task_view ?? 'list',
            showWeekNumbers: prefs.show_week_numbers ?? false,
          });
        }
        
        setDataLoaded(true);
      } catch (err) {
        console.error('Failed to fetch preferences:', err);
        setError('Failed to load settings. Please refresh the page.');
        setDataLoaded(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [user]);

  const handleNotificationChange = async (key) => {
    const newValue = !notifications[key];
    setNotifications((prev) => ({ ...prev, [key]: newValue }));
    setSuccess('');
    
    try {
      setSaving(true);
      const data = {
        ...notifications,
        [key]: newValue,
        theme: preferences.theme,
        language: preferences.language,
        calendar_type: preferences.calendarType,
        date_format: getBackendDateFormat(preferences.dateFormat),
        time_format: getBackendTimeFormat(preferences.timeFormat),
        start_of_week: { 'sunday': 0, 'monday': 1, 'saturday': 6 }[preferences.startOfWeek] ?? 1,
        default_task_view: preferences.defaultTaskView,
        show_week_numbers: preferences.showWeekNumbers,
      };
      await preferenceService.updatePreferences(data);
      await refreshUser();
      setSuccess('Setting saved!');
    } catch (err) {
      console.error('Failed to save notification setting:', err);
      setNotifications((prev) => ({ ...prev, [key]: !newValue }));
      setError('Failed to save setting. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setPreferences((prev) => ({ ...prev, [name]: value }));
    setSuccess('');
    
    if (name === 'theme') {
      setTheme(value);
    }
    
    if (name === 'language') {
      changeLanguage(value);
    }
  };

  // REAL API call to save settings
  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const backendDateFormat = getBackendDateFormat(preferences.dateFormat);
      const backendTimeFormat = getBackendTimeFormat(preferences.timeFormat);
      const startOfWeekMap = {
        'sunday': 0,
        'monday': 1,
        'saturday': 6,
      };

      const data = {
        ...notifications,
        theme: preferences.theme,
        language: preferences.language,
        calendar_type: preferences.calendarType,
        date_format: backendDateFormat,
        time_format: backendTimeFormat,
        start_of_week: startOfWeekMap[preferences.startOfWeek] ?? 1,
        default_task_view: preferences.defaultTaskView,
        show_week_numbers: preferences.showWeekNumbers,
      };
      
      await preferenceService.updatePreferences(data);
      await refreshUser();
      
      setSuccess('Settings saved successfully!');
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError(err.response?.data?.message || 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle export data
  const handleExportData = async () => {
    if (!window.confirm('Are you sure you want to export all your data?')) return;
    
    try {
      setLoading(true);
      const blob = await preferenceService.exportData();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccess('Data exported successfully!');
    } catch (err) {
      console.error('Failed to export data:', err);
      setError('Failed to export data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      '⚠️ WARNING: This will PERMANENTLY delete your account and ALL associated data.\n\nThis action CANNOT be undone.\n\nAre you absolutely sure you want to continue?'
    );
    
    if (!confirmation) return;
    
    const secondConfirmation = window.prompt(
      'Type "DELETE" to confirm account deletion:'
    );
    
    if (secondConfirmation !== 'DELETE') {
      setError('Account deletion cancelled. You must type "DELETE" to confirm.');
      return;
    }
    
    try {
      setLoading(true);
      await preferenceService.deleteAccount();
      
      localStorage.removeItem('auth_token');
      window.location.href = '/';
    } catch (err) {
      console.error('Failed to delete account:', err);
      setError(err.response?.data?.message || 'Failed to delete account. Please try again.');
      setLoading(false);
    }
  };

  const themeOptions = [
    { value: 'light', label: t ? t('settings.themeLight') : 'Light' },
    { value: 'dark', label: t ? t('settings.themeDark') : 'Dark' },
    { value: 'system', label: t ? t('settings.themeSystem') : 'System' },
  ];

  const languageOptions = [
    { value: 'en', label: t ? t('settings.languageEn') : 'English' },
    { value: 'fa', label: t ? t('settings.languageFa') : 'Persian (فارسی)' },
  ];

  const SettingSection = ({ title, description, children }) => (
    <Box sx={{ py: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'var(--theme-font-weight-semibold, 600)', mb: 0.5 }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>
      {children}
    </Box>
  );

  const SettingRow = ({ label, description, children }) => (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      py: 2,
      borderBottom: 1,
      borderColor: 'divider',
    }}>
      <Box sx={{ flex: 1, mr: 2 }}>
        <Typography variant="body1" sx={{ fontWeight: 'var(--theme-font-weight-medium, 500)' }}>
          {label}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>
      <Box sx={{ flexShrink: 0 }}>
        {children}
      </Box>
    </Box>
  );

  if (loading && !dataLoaded) {
    return (
      <AppLayout>
        <Container maxWidth="md">
          <PageHeader
            title="Settings"
            description="Manage your app preferences and notification settings"
          />
          <Card>
            <CardContent>
              <Box sx={{ opacity: 0.5 }}>
                <Box sx={{ height: 32, width: '25%', bgcolor: 'action.hover', borderRadius: 1, mb: 2 }} />
                <Box sx={{ height: 48, bgcolor: 'action.hover', borderRadius: 1, mb: 1 }} />
                <Box sx={{ height: 48, bgcolor: 'action.hover', borderRadius: 1 }} />
              </Box>
            </CardContent>
          </Card>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container maxWidth="md">
        <PageHeader
          title="Settings"
          description="Manage your app preferences and notification settings"
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

        {/* Notification Settings */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <SettingSection
              title="Notification Preferences"
              description="Choose how you want to be notified about your tasks and updates"
            >
              <Box sx={{ borderTop: 1, borderBottom: 1, borderColor: 'divider' }}>
                <SettingRow
                  label="Email Notifications"
                  description="Receive notifications via email"
                >
                  <Switch
                    checked={notifications.emailNotifications}
                    onChange={() => handleNotificationChange('emailNotifications')}
                    disabled={saving}
                  />
                </SettingRow>

                <SettingRow
                  label="Push Notifications"
                  description="Receive push notifications in your browser"
                >
                  <Switch
                    checked={notifications.pushNotifications}
                    onChange={() => handleNotificationChange('pushNotifications')}
                    disabled={saving}
                  />
                </SettingRow>

                <SettingRow
                  label="Task Reminders"
                  description="Get reminded about upcoming and overdue tasks"
                >
                  <Switch
                    checked={notifications.taskReminders}
                    onChange={() => handleNotificationChange('taskReminders')}
                    disabled={saving}
                  />
                </SettingRow>

                <SettingRow
                  label="Daily Digest"
                  description="Receive a daily summary of your tasks"
                >
                  <Switch
                    checked={notifications.dailyDigest}
                    onChange={() => handleNotificationChange('dailyDigest')}
                    disabled={saving}
                  />
                </SettingRow>

                <SettingRow
                  label="Weekly Report"
                  description="Get a weekly productivity report"
                >
                  <Switch
                    checked={notifications.weeklyReport}
                    onChange={() => handleNotificationChange('weeklyReport')}
                    disabled={saving}
                  />
                </SettingRow>

                <SettingRow
                  label="Marketing Emails"
                  description="Receive updates about new features and promotions"
                >
                  <Switch
                    checked={notifications.marketingEmails}
                    onChange={() => handleNotificationChange('marketingEmails')}
                    disabled={saving}
                  />
                </SettingRow>
              </Box>
            </SettingSection>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <SettingSection
              title="App Preferences"
              description="Customize how the app looks and behaves"
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Theme</InputLabel>
                    <Select
                      name="theme"
                      value={preferences.theme}
                      onChange={handlePreferenceChange}
                      label="Theme"
                    >
                      {themeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth size="small">
                    <InputLabel>Language</InputLabel>
                    <Select
                      name="language"
                      value={preferences.language}
                      onChange={handlePreferenceChange}
                      label="Language"
                    >
                      {languageOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Date Format</InputLabel>
                    <Select
                      name="dateFormat"
                      value={preferences.dateFormat}
                      onChange={handlePreferenceChange}
                      label="Date Format"
                    >
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                      <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth size="small">
                    <InputLabel>Time Format</InputLabel>
                    <Select
                      name="timeFormat"
                      value={preferences.timeFormat}
                      onChange={handlePreferenceChange}
                      label="Time Format"
                    >
                      <MenuItem value="12h">12-hour (AM/PM)</MenuItem>
                      <MenuItem value="24h">24-hour</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Start of Week</InputLabel>
                    <Select
                      name="startOfWeek"
                      value={preferences.startOfWeek}
                      onChange={handlePreferenceChange}
                      label="Start of Week"
                    >
                      <MenuItem value="sunday">Sunday</MenuItem>
                      <MenuItem value="monday">Monday</MenuItem>
                      <MenuItem value="saturday">Saturday</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth size="small">
                    <InputLabel>Default Task View</InputLabel>
                    <Select
                      name="defaultTaskView"
                      value={preferences.defaultTaskView}
                      onChange={handlePreferenceChange}
                      label="Default Task View"
                    >
                      <MenuItem value="list">List View</MenuItem>
                      <MenuItem value="board">Board View</MenuItem>
                      <MenuItem value="calendar">Calendar View</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </SettingSection>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <SettingSection
              title="Data & Privacy"
              description="Manage your data and privacy settings"
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box 
                  sx={{ 
                    p: 3, 
                    bgcolor: 'grey.50', 
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2
                  }}
                >
                  <Box sx={{ color: 'text.secondary', mt: 0.5 }}>
                    <DescriptionIcon />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Export Your Data
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Download a copy of all your tasks and account data.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      sx={{ mt: 2 }}
                      onClick={handleExportData}
                      disabled={loading}
                    >
                      Export Data
                    </Button>
                  </Box>
                </Box>

                <Box 
                  sx={{ 
                    p: 3, 
                    bgcolor: 'error.light', 
                    borderRadius: 2,
                    border: 1,
                    borderColor: 'error.light',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2
                  }}
                >
                  <Box sx={{ color: 'error.main', mt: 0.5 }}>
                    <ErrorOutlineIcon />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: 'error.dark' }}>
                      Delete Account
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, color: 'error.dark' }}>
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="error"
                      size="small" 
                      sx={{ mt: 2 }}
                      onClick={handleDeleteAccount}
                      disabled={loading}
                    >
                      Delete Account
                    </Button>
                  </Box>
                </Box>
              </Box>
            </SettingSection>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            onClick={handleSave} 
            loading={saving}
            disabled={saving}
          >
            Save All Settings
          </Button>
        </Box>
      </Container>
    </AppLayout>
  );
};

export default Settings;
