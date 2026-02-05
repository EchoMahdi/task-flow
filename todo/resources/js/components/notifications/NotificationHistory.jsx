import React, { useState, useEffect } from 'react';
import { Bell, Mail, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';

const NotificationHistory = ({ limit = 50 }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchNotificationHistory();
    }, [limit]);

    const fetchNotificationHistory = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/notifications/history?limit=${limit}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch notification history');

            const data = await response.json();
            setNotifications(data.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'sent':
                return <CheckCircle size={18} className="status-icon sent" />;
            case 'failed':
                return <XCircle size={18} className="status-icon failed" />;
            default:
                return <Clock size={18} className="status-icon pending" />;
        }
    };

    const getChannelIcon = (channel) => {
        switch (channel) {
            case 'email':
                return <Mail size={16} />;
            default:
                return <Bell size={16} />;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'sent':
                return 'Delivered';
            case 'failed':
                return 'Failed';
            default:
                return 'Pending';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    if (loading) {
        return (
            <div className="notification-history loading">
                <div className="loading-spinner">Loading notification history...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="notification-history error">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="notification-history">
            <div className="history-header">
                <Bell className="header-icon" />
                <h2>Notification History</h2>
            </div>

            {notifications.length === 0 ? (
                <div className="empty-state">
                    <Bell size={48} />
                    <p>No notifications sent yet</p>
                    <span>When you receive task reminders, they will appear here</span>
                </div>
            ) : (
                <div className="notifications-list">
                    {notifications.map((notification) => (
                        <div 
                            key={notification.id} 
                            className={`notification-item ${notification.status}`}
                        >
                            <div className="notification-icon">
                                {getChannelIcon(notification.channel)}
                            </div>
                            
                            <div className="notification-details">
                                <div className="notification-header">
                                    <span className="notification-channel">
                                        {notification.channel_label}
                                    </span>
                                    <span className={`notification-status ${notification.status}`}>
                                        {getStatusIcon(notification.status)}
                                        {getStatusLabel(notification.status)}
                                    </span>
                                </div>
                                
                                <div className="notification-info">
                                    <span className="notification-task">
                                        Task ID: {notification.task_id}
                                    </span>
                                    <span className="notification-time">
                                        {formatDate(notification.created_at)}
                                    </span>
                                </div>

                                {notification.error_message && (
                                    <div className="notification-error-message">
                                        {notification.error_message}
                                    </div>
                                )}
                            </div>

                            <a 
                                href={`/tasks/${notification.task_id}`}
                                className="notification-link"
                                title="View task"
                            >
                                <ExternalLink size={16} />
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationHistory;
