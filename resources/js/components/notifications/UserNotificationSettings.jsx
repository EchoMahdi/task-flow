import React, { useState, useEffect } from 'react';
import { Settings, Bell, Mail, Globe, Clock, ToggleLeft, ToggleRight, Save } from 'lucide-react';

const UserNotificationSettings = () => {
    const [settings, setSettings] = useState({
        emailNotificationsEnabled: true,
        inAppNotificationsEnabled: true,
        timezone: 'UTC',
        defaultReminderOffset: 30,
        defaultReminderUnit: 'minutes'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchUserSettings();
    }, []);

    const fetchUserSettings = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/notifications/settings', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch notification settings');

            const data = await response.json();
            setSettings(data.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(false);

            await fetch('/api/notifications/settings', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email_notifications_enabled: settings.emailNotificationsEnabled,
                    in_app_notifications_enabled: settings.inAppNotificationsEnabled,
                    timezone: settings.timezone,
                    default_reminder_offset: settings.defaultReminderOffset,
                    default_reminder_unit: settings.defaultReminderUnit
                })
            });

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = (field) => {
        setSettings(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleTimeChange = (e) => {
        setSettings(prev => ({
            ...prev,
            defaultReminderOffset: parseInt(e.target.value, 10)
        }));
    };

    const handleUnitChange = (e) => {
        setSettings(prev => ({
            ...prev,
            defaultReminderUnit: e.target.value
        }));
    };

    const handleTimezoneChange = (e) => {
        setSettings(prev => ({
            ...prev,
            timezone: e.target.value
        }));
    };

    const getDefaultReminderText = () => {
        const { defaultReminderOffset, defaultReminderUnit } = settings;
        const unitLabel = defaultReminderUnit === 'hours' ? 'hour' : 
                          defaultReminderUnit === 'days' ? 'day' : 'minute';
        const plural = defaultReminderOffset > 1 ? 's' : '';
        return `${defaultReminderOffset} ${unitLabel}${plural} before due`;
    };

    if (loading) {
        return (
            <div className="user-notification-settings loading">
                <div className="loading-spinner">Loading settings...</div>
            </div>
        );
    }

    return (
        <div className="user-notification-settings">
            <div className="settings-header">
                <Settings className="header-icon" />
                <h2>Notification Settings</h2>
            </div>

            <div className="settings-content">
                {error && (
                    <div className="settings-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="settings-success">
                        Settings saved successfully!
                    </div>
                )}

                <div className="settings-section">
                    <h3 className="section-title">
                        <Mail size={20} />
                        Email Notifications
                    </h3>

                    <div className="setting-item">
                        <div className="setting-info">
                            <span className="setting-label">Enable email notifications</span>
                            <span className="setting-description">
                                Receive task reminders via email
                            </span>
                        </div>
                        <button
                            className={`toggle-btn ${settings.emailNotificationsEnabled ? 'active' : ''}`}
                            onClick={() => handleToggle('emailNotificationsEnabled')}
                        >
                            {settings.emailNotificationsEnabled ? (
                                <ToggleRight size={28} />
                            ) : (
                                <ToggleLeft size={28} />
                            )}
                        </button>
                    </div>
                </div>

                <div className="settings-section">
                    <h3 className="section-title">
                        <Bell size={20} />
                        In-App Notifications
                    </h3>

                    <div className="setting-item">
                        <div className="setting-info">
                            <span className="setting-label">Enable in-app notifications</span>
                            <span className="setting-description">
                                Receive notifications within the application
                            </span>
                        </div>
                        <button
                            className={`toggle-btn ${settings.inAppNotificationsEnabled ? 'active' : ''}`}
                            onClick={() => handleToggle('inAppNotificationsEnabled')}
                        >
                            {settings.inAppNotificationsEnabled ? (
                                <ToggleRight size={28} />
                            ) : (
                                <ToggleLeft size={28} />
                            )}
                        </button>
                    </div>
                </div>

                <div className="settings-section">
                    <h3 className="section-title">
                        <Clock size={20} />
                        Default Reminder Time
                    </h3>

                    <div className="setting-item">
                        <div className="setting-info">
                            <span className="setting-label">Default reminder</span>
                            <span className="setting-description">
                                {getDefaultReminderText()}
                            </span>
                        </div>
                        <div className="time-selector">
                            <input
                                type="number"
                                min="1"
                                max="99"
                                value={settings.defaultReminderOffset}
                                onChange={handleTimeChange}
                            />
                            <select
                                value={settings.defaultReminderUnit}
                                onChange={handleUnitChange}
                            >
                                <option value="minutes">Minutes</option>
                                <option value="hours">Hours</option>
                                <option value="days">Days</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="settings-section">
                    <h3 className="section-title">
                        <Globe size={20} />
                        Timezone
                    </h3>

                    <div className="setting-item">
                        <div className="setting-info">
                            <span className="setting-label">Your timezone</span>
                            <span className="setting-description">
                                All notifications will respect this timezone
                            </span>
                        </div>
                        <select
                            value={settings.timezone}
                            onChange={handleTimezoneChange}
                            className="timezone-select"
                        >
                            <option value="UTC">UTC</option>
                            <option value="America/New_York">Eastern Time (ET)</option>
                            <option value="America/Chicago">Central Time (CT)</option>
                            <option value="America/Denver">Mountain Time (MT)</option>
                            <option value="America/Los_Angeles">Pacific Time (PT)</option>
                            <option value="Europe/London">London (GMT)</option>
                            <option value="Europe/Paris">Paris (CET)</option>
                            <option value="Asia/Tokyo">Tokyo (JST)</option>
                            <option value="Asia/Shanghai">Shanghai (CST)</option>
                        </select>
                    </div>
                </div>

                <div className="settings-actions">
                    <button
                        className="save-btn"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserNotificationSettings;
