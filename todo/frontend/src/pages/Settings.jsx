import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/index';
import { Card, CardBody, Button, Toggle, Select, Alert, PageHeader, Divider } from '../components/ui/index';
import { Icons } from '../components/ui/Icons';
import { preferenceService } from '../services/preferenceService';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { setTheme, toggleDarkMode } from '../App';

const Settings = () => {
  const { user, refreshUser, logout } = useAuth();
  const { t, changeLanguage, direction } = useI18n();
  const navigate = useNavigate();
  
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
    dateFormat: 'm/d/Y',  // PHP format
    timeFormat: 'h:i A',  // PHP format
    startOfWeek: 1,  // monday = 1
    defaultTaskView: 'list',
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
          // Map backend snake_case to frontend camelCase
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
            dateFormat: getDateFormatValue(prefs.date_format),
            timeFormat: getTimeFormatValue(prefs.time_format),
            startOfWeek: prefs.start_of_week === 0 ? 'sunday' : (prefs.start_of_week === 6 ? 'saturday' : 'monday'),
            defaultTaskView: prefs.default_task_view ?? 'list',
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

  const handleNotificationChange = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    setSuccess(''); // Clear previous success messages
  };

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setPreferences((prev) => ({ ...prev, [name]: value }));
    setSuccess(''); // Clear previous success messages
    
    // Apply theme change immediately
    if (name === 'theme') {
      setTheme(value);
    }
    
    // Apply language change immediately
    if (name === 'language') {
      changeLanguage(value);
    }
  };

  // REAL API call to save settings - no more mock behavior
  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Convert frontend format to backend format
      const backendDateFormat = getBackendDateFormat(preferences.dateFormat);
      const backendTimeFormat = getBackendTimeFormat(preferences.timeFormat);
      const startOfWeekMap = {
        'sunday': 0,
        'monday': 1,
        'saturday': 6,
      };

      // Combine notifications and preferences into one object
      const data = {
        ...notifications,
        theme: preferences.theme,
        language: preferences.language,
        date_format: backendDateFormat,
        time_format: backendTimeFormat,
        start_of_week: startOfWeekMap[preferences.startOfWeek] ?? 1,
        default_task_view: preferences.defaultTaskView,
      };
      
      // Make real API call to backend
      await preferenceService.updatePreferences(data);
      
      // Refresh user data to get updated preferences
      await refreshUser();
      
      setSuccess('Settings saved successfully!');
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError(err.response?.data?.message || 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle export data - creates real downloadable file
  const handleExportData = async () => {
    if (!window.confirm('Are you sure you want to export all your data?')) return;
    
    try {
      setLoading(true);
      const blob = await preferenceService.exportData();
      
      // Create download link
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

  // Handle delete account - permanent deletion
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
      
      // Clear local storage and redirect to home
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

  const dateFormatOptions = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  ];

  const timeFormatOptions = [
    { value: '12h', label: '12-hour (AM/PM)' },
    { value: '24h', label: '24-hour' },
  ];

  const weekStartOptions = [
    { value: 'sunday', label: 'Sunday' },
    { value: 'monday', label: 'Monday' },
    { value: 'saturday', label: 'Saturday' },
  ];

  const taskViewOptions = [
    { value: 'list', label: 'List View' },
    { value: 'board', label: 'Board View' },
    { value: 'calendar', label: 'Calendar View' },
  ];

  const SettingSection = ({ title, description, children }) => (
    <div className="py-6 first:pt-0 last:pb-0">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>
        {description && <p className="text-sm text-secondary-500 mt-1">{description}</p>}
      </div>
      {children}
    </div>
  );

  const SettingRow = ({ label, description, children }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 pr-4">
        <p className="font-medium text-secondary-900">{label}</p>
        {description && <p className="text-sm text-secondary-500 mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );

  if (loading && !dataLoaded) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto">
          <PageHeader
            title="Settings"
            description="Manage your app preferences and notification settings"
          />
          <Card className="mb-6">
            <CardBody>
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-secondary-200 rounded w-1/4"></div>
                <div className="h-10 bg-secondary-200 rounded"></div>
                <div className="h-10 bg-secondary-200 rounded"></div>
              </div>
            </CardBody>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <PageHeader
          title="Settings"
          description="Manage your app preferences and notification settings"
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

        {/* Notification Settings */}
        <Card className="mb-6">
          <CardBody>
            <SettingSection
              title="Notification Preferences"
              description="Choose how you want to be notified about your tasks and updates"
            >
              <div className="divide-y divide-secondary-100">
                <SettingRow
                  label="Email Notifications"
                  description="Receive notifications via email"
                >
                  <Toggle
                    checked={notifications.emailNotifications}
                    onChange={() => handleNotificationChange('emailNotifications')}
                  />
                </SettingRow>

                <SettingRow
                  label="Push Notifications"
                  description="Receive push notifications in your browser"
                >
                  <Toggle
                    checked={notifications.pushNotifications}
                    onChange={() => handleNotificationChange('pushNotifications')}
                  />
                </SettingRow>

                <SettingRow
                  label="Task Reminders"
                  description="Get reminded about upcoming and overdue tasks"
                >
                  <Toggle
                    checked={notifications.taskReminders}
                    onChange={() => handleNotificationChange('taskReminders')}
                  />
                </SettingRow>

                <SettingRow
                  label="Daily Digest"
                  description="Receive a daily summary of your tasks"
                >
                  <Toggle
                    checked={notifications.dailyDigest}
                    onChange={() => handleNotificationChange('dailyDigest')}
                  />
                </SettingRow>

                <SettingRow
                  label="Weekly Report"
                  description="Get a weekly productivity report"
                >
                  <Toggle
                    checked={notifications.weeklyReport}
                    onChange={() => handleNotificationChange('weeklyReport')}
                  />
                </SettingRow>

                <SettingRow
                  label="Marketing Emails"
                  description="Receive updates about new features and promotions"
                >
                  <Toggle
                    checked={notifications.marketingEmails}
                    onChange={() => handleNotificationChange('marketingEmails')}
                  />
                </SettingRow>
              </div>
            </SettingSection>
          </CardBody>
        </Card>

        {/* App Preferences */}
        <Card className="mb-6">
          <CardBody>
            <SettingSection
              title="App Preferences"
              description="Customize how the app looks and behaves"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label={t ? t('settings.theme') : 'Theme'}
                    name="theme"
                    value={preferences.theme}
                    onChange={handlePreferenceChange}
                    options={themeOptions}
                  />
                  <Select
                    label={t ? t('settings.language') : 'Language'}
                    name="language"
                    value={preferences.language}
                    onChange={handlePreferenceChange}
                    options={languageOptions}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Date Format"
                    name="dateFormat"
                    value={preferences.dateFormat}
                    onChange={handlePreferenceChange}
                    options={dateFormatOptions}
                  />
                  <Select
                    label="Time Format"
                    name="timeFormat"
                    value={preferences.timeFormat}
                    onChange={handlePreferenceChange}
                    options={timeFormatOptions}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Start of Week"
                    name="startOfWeek"
                    value={preferences.startOfWeek}
                    onChange={handlePreferenceChange}
                    options={weekStartOptions}
                  />
                  <Select
                    label="Default Task View"
                    name="defaultTaskView"
                    value={preferences.defaultTaskView}
                    onChange={handlePreferenceChange}
                    options={taskViewOptions}
                  />
                </div>
              </div>
            </SettingSection>
          </CardBody>
        </Card>

        {/* Data & Privacy */}
        <Card className="mb-6">
          <CardBody>
            <SettingSection
              title="Data & Privacy"
              description="Manage your data and privacy settings"
            >
              <div className="space-y-4">
                <div className="p-4 bg-secondary-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Icons.Document className="w-5 h-5 text-secondary-500 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-secondary-900">Export Your Data</h4>
                      <p className="text-sm text-secondary-500 mt-1">
                        Download a copy of all your tasks and account data.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={handleExportData}
                        loading={loading}
                        disabled={loading}
                      >
                        Export Data
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-danger-50 rounded-lg border border-danger-200">
                  <div className="flex items-start gap-3">
                    <Icons.ExclamationTriangle className="w-5 h-5 text-danger-500 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-danger-900">Delete Account</h4>
                      <p className="text-sm text-danger-700 mt-1">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        className="mt-3"
                        onClick={handleDeleteAccount}
                        loading={loading}
                        disabled={loading}
                      >
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </SettingSection>
          </CardBody>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} loading={saving} disabled={saving}>
            Save All Settings
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
