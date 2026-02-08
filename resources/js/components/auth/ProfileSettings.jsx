import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Globe, Bell, Shield, Save, X } from 'lucide-react';

const ProfileSettings = ({ onClose }) => {
    const [user, setUser] = useState(null);
    const [preferences, setPreferences] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Failed to fetch user data');

            const data = await response.json();
            setUser(data.data);
            setPreferences(data.data.preferences);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (formData) => {
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            setUser(data.data);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handlePreferencesUpdate = async (newPreferences) => {
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch('/api/auth/preferences', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newPreferences),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update preferences');
            }

            setPreferences(data.data);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-settings loading">
                <div className="loading-spinner">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="profile-settings">
            <div className="profile-header">
                <div className="header-content">
                    {user?.avatar_url && (
                        <img src={user.avatar_url} alt={user.name} className="avatar" />
                    )}
                    <div className="user-info">
                        <h2>{user?.name}</h2>
                        <p>{user?.email}</p>
                    </div>
                </div>
                <button className="close-btn" onClick={onClose}>
                    <X size={20} />
                </button>
            </div>

            <div className="profile-tabs">
                <button
                    className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    <User size={18} />
                    Profile
                </button>
                <button
                    className={`tab ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    <Shield size={18} />
                    Security
                </button>
                <button
                    className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notifications')}
                >
                    <Bell size={18} />
                    Notifications
                </button>
                <button
                    className={`tab ${activeTab === 'preferences' ? 'active' : ''}`}
                    onClick={() => setActiveTab('preferences')}
                >
                    <Globe size={18} />
                    Preferences
                </button>
            </div>

            <div className="profile-content">
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">Settings saved successfully!</div>}

                {activeTab === 'profile' && (
                    <ProfileForm user={user} onSave={handleProfileUpdate} saving={saving} />
                )}

                {activeTab === 'security' && (
                    <SecurityForm user={user} onSave={handleProfileUpdate} saving={saving} />
                )}

                {activeTab === 'notifications' && (
                    <NotificationForm preferences={preferences} onSave={handlePreferencesUpdate} saving={saving} />
                )}

                {activeTab === 'preferences' && (
                    <PreferencesForm preferences={preferences} onSave={handlePreferencesUpdate} saving={saving} />
                )}
            </div>
        </div>
    );
};

const ProfileForm = ({ user, onSave, saving }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        timezone: user?.timezone || 'UTC',
        locale: user?.locale || 'en',
        profile: {
            bio: user?.profile?.bio || '',
            website: user?.profile?.website || '',
            company: user?.profile?.company || '',
            job_title: user?.profile?.job_title || '',
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
                <h3>Basic Information</h3>
                
                <div className="form-group">
                    <label>Full Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Timezone</label>
                    <select
                        value={formData.timezone}
                        onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                        <option value="Europe/London">London</option>
                        <option value="Europe/Paris">Paris</option>
                        <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                </div>
            </div>

            <div className="form-section">
                <h3>Additional Information</h3>
                
                <div className="form-group">
                    <label>Bio</label>
                    <textarea
                        value={formData.profile.bio}
                        onChange={(e) => setFormData({
                            ...formData,
                            profile: { ...formData.profile, bio: e.target.value }
                        })}
                        rows={3}
                        placeholder="Tell us about yourself"
                    />
                </div>

                <div className="form-group">
                    <label>Website</label>
                    <input
                        type="url"
                        value={formData.profile.website}
                        onChange={(e) => setFormData({
                            ...formData,
                            profile: { ...formData.profile, website: e.target.value }
                        })}
                        placeholder="https://yourwebsite.com"
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Company</label>
                        <input
                            type="text"
                            value={formData.profile.company}
                            onChange={(e) => setFormData({
                                ...formData,
                                profile: { ...formData.profile, company: e.target.value }
                            })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Job Title</label>
                        <input
                            type="text"
                            value={formData.profile.job_title}
                            onChange={(e) => setFormData({
                                ...formData,
                                profile: { ...formData.profile, job_title: e.target.value }
                            })}
                        />
                    </div>
                </div>
            </div>

            <div className="form-actions">
                <button type="submit" className="save-btn" disabled={saving}>
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};

const SecurityForm = ({ user, onSave, saving }) => {
    const [formData, setFormData] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.password_confirmation) {
            alert('Passwords do not match');
            return;
        }

        await onSave(formData);
        setFormData({ current_password: '', password: '', password_confirmation: '' });
    };

    return (
        <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
                <h3>Change Password</h3>
                
                <div className="form-group">
                    <label>Current Password</label>
                    <input
                        type="password"
                        value={formData.current_password}
                        onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>New Password</label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        minLength={8}
                    />
                    <span className="input-hint">Must be at least 8 characters</span>
                </div>

                <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                        type="password"
                        value={formData.password_confirmation}
                        onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div className="form-actions">
                <button type="submit" className="save-btn" disabled={saving}>
                    <Lock size={18} />
                    {saving ? 'Updating...' : 'Update Password'}
                </button>
            </div>
        </form>
    );
};

const NotificationForm = ({ preferences, onSave, saving }) => {
    const [formData, setFormData] = useState({
        email_notifications: preferences?.email_notifications ?? true,
        push_notifications: preferences?.push_notifications ?? true,
        weekly_digest: preferences?.weekly_digest ?? false,
        marketing_emails: preferences?.marketing_emails ?? false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const Toggle = ({ label, description, checked, onChange }) => (
        <div className="toggle-item">
            <div className="toggle-info">
                <span className="toggle-label">{label}</span>
                <span className="toggle-description">{description}</span>
            </div>
            <button
                type="button"
                className={`toggle-btn ${checked ? 'active' : ''}`}
                onClick={() => onChange(!checked)}
            >
                {checked ? 'ON' : 'OFF'}
            </button>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
                <h3>Email Notifications</h3>
                
                <Toggle
                    label="Task Reminders"
                    description="Receive email reminders for upcoming task deadlines"
                    checked={formData.email_notifications}
                    onChange={(value) => setFormData({ ...formData, email_notifications: value })}
                />

                <Toggle
                    label="Weekly Digest"
                    description="Get a weekly summary of your tasks and progress"
                    checked={formData.weekly_digest}
                    onChange={(value) => setFormData({ ...formData, weekly_digest: value })}
                />

                <Toggle
                    label="Marketing Emails"
                    description="Receive updates about new features and promotions"
                    checked={formData.marketing_emails}
                    onChange={(value) => setFormData({ ...formData, marketing_emails: value })}
                />
            </div>

            <div className="form-actions">
                <button type="submit" className="save-btn" disabled={saving}>
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Preferences'}
                </button>
            </div>
        </form>
    );
};

const PreferencesForm = ({ preferences, onSave, saving }) => {
    const [formData, setFormData] = useState({
        theme: preferences?.theme || 'light',
        language: preferences?.language || 'en',
        date_format: preferences?.date_format || 'Y-m-d',
        time_format: preferences?.time_format || 'H:i',
        items_per_page: preferences?.items_per_page || 20,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
                <h3>Appearance</h3>
                
                <div className="form-group">
                    <label>Theme</label>
                    <select
                        value={formData.theme}
                        onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System Default</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Language</label>
                    <select
                        value={formData.language}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                    </select>
                </div>
            </div>

            <div className="form-section">
                <h3>Date & Time</h3>
                
                <div className="form-group">
                    <label>Date Format</label>
                    <select
                        value={formData.date_format}
                        onChange={(e) => setFormData({ ...formData, date_format: e.target.value })}
                    >
                        <option value="Y-m-d">YYYY-MM-DD</option>
                        <option value="m/d/Y">MM/DD/YYYY</option>
                        <option value="d/m/Y">DD/MM/YYYY</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Time Format</label>
                    <select
                        value={formData.time_format}
                        onChange={(e) => setFormData({ ...formData, time_format: e.target.value })}
                    >
                        <option value="H:i">24-hour (14:30)</option>
                        <option value="h:i A">12-hour (2:30 PM)</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Items Per Page</label>
                    <input
                        type="number"
                        value={formData.items_per_page}
                        onChange={(e) => setFormData({ ...formData, items_per_page: parseInt(e.target.value) })}
                        min={5}
                        max={100}
                    />
                </div>
            </div>

            <div className="form-actions">
                <button type="submit" className="save-btn" disabled={saving}>
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Preferences'}
                </button>
            </div>
        </form>
    );
};

export default ProfileSettings;
