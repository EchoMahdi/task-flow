import React, { useState, useEffect } from 'react';
import { Bell, Clock, Mail, ToggleLeft, ToggleRight, Save, X } from 'lucide-react';

const NotificationSettings = ({ taskId, onClose }) => {
    const [settings, setSettings] = useState({
        emailNotifications: true,
        reminderTime: 30,
        reminderUnit: 'minutes',
        notifications: []
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchNotificationSettings();
    }, [taskId]);

    const fetchNotificationSettings = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/tasks/${taskId}/notifications`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch notification settings');

            const data = await response.json();
            setSettings({
                emailNotifications: true,
                reminderTime: data.data[0]?.reminder_offset || 30,
                reminderUnit: data.data[0]?.reminder_unit || 'minutes',
                notifications: data.data || []
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleEmail = () => {
        setSettings(prev => ({
            ...prev,
            emailNotifications: !prev.emailNotifications
        }));
    };

    const handleTimeChange = (e) => {
        setSettings(prev => ({
            ...prev,
            reminderTime: parseInt(e.target.value, 10)
        }));
    };

    const handleUnitChange = (e) => {
        setSettings(prev => ({
            ...prev,
            reminderUnit: e.target.value
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(false);

            // Create or update notification rule
            const existingRule = settings.notifications[0];
            
            if (existingRule) {
                await fetch(`/api/notifications/${existingRule.id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        reminder_offset: settings.reminderTime,
                        reminder_unit: settings.reminderUnit,
                        is_enabled: settings.emailNotifications
                    })
                });
            } else {
                await fetch(`/api/tasks/${taskId}/notifications`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        reminder_offset: settings.reminderTime,
                        reminder_unit: settings.reminderUnit,
                        is_enabled: settings.emailNotifications,
                        channel: 'email'
                    })
                });
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const getReminderText = () => {
        const { reminderTime, reminderUnit } = settings;
        const unitLabel = reminderUnit === 'hours' ? 'hour' : 
                          reminderUnit === 'days' ? 'day' : 'minute';
        const plural = reminderTime > 1 ? 's' : '';
        return `${reminderTime} ${unitLabel}${plural} before due`;
    };

    if (loading) {
        return (
            <div className="notification-settings loading">
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    return (
        <div className="notification-settings">
            <div className="notification-header">
                <Bell className="header-icon" />
                <h3>Notification Settings</h3>
                <button className="close-btn" onClick={onClose}>
                    <X size={20} />
                </button>
            </div>

            <div className="notification-content">
                {error && (
                    <div className="notification-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="notification-success">
                        Settings saved successfully!
                    </div>
                )}

                <div className="setting-group">
                    <div className="setting-label">
                        <Mail size={18} />
                        <span>Email Notifications</span>
                    </div>
                    <button 
                        className={`toggle-btn ${settings.emailNotifications ? 'active' : ''}`}
                        onClick={handleToggleEmail}
                    >
                        {settings.emailNotifications ? (
                            <ToggleRight size={24} />
                        ) : (
                            <ToggleLeft size={24} />
                        )}
                        <span>{settings.emailNotifications ? 'Enabled' : 'Disabled'}</span>
                    </button>
                </div>

                <div className="setting-group">
                    <div className="setting-label">
                        <Clock size={18} />
                        <span>Remind me before due date</span>
                    </div>
                    <div className="reminder-time-selector">
                        <input
                            type="number"
                            min="1"
                            max="99"
                            value={settings.reminderTime}
                            onChange={handleTimeChange}
                            disabled={!settings.emailNotifications}
                        />
                        <select
                            value={settings.reminderUnit}
                            onChange={handleUnitChange}
                            disabled={!settings.emailNotifications}
                        >
                            <option value="minutes">Minutes</option>
                            <option value="hours">Hours</option>
                            <option value="days">Days</option>
                        </select>
                    </div>
                </div>

                <div className="setting-preview">
                    <span className="preview-label">You will receive an email:</span>
                    <span className="preview-text">{getReminderText()}</span>
                </div>

                <div className="setting-actions">
                    <button 
                        className="save-btn"
                        onClick={handleSave}
                        disabled={saving || !settings.emailNotifications}
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettings;
