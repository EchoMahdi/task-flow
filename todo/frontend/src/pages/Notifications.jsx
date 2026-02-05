import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout/index';
import { Card, CardBody, Badge, Button, Tabs, EmptyState, Skeleton, PageHeader } from '../components/ui/index';
import { Icons } from '../components/ui/Icons';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/authService';

const Notifications = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // REAL API call to fetch notifications from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications/history');
        setNotifications(response.data.data || []);
        setUnreadCount(response.data.data?.filter(n => !n.read).length || 0);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        // If API fails, show empty state (no mock data)
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, []);

  const tabs = [
    { id: 'all', label: 'All', icon: <Icons.Bell className="w-4 h-4" /> },
    { id: 'unread', label: 'Unread', icon: <Icons.BellAlert className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <Icons.ClipboardList className="w-4 h-4" /> },
    { id: 'system', label: 'System', icon: <Icons.Cog className="w-4 h-4" /> },
  ];

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    if (activeTab === 'tasks') return ['task_due', 'task_completed', 'task_overdue'].includes(notification.type);
    if (activeTab === 'system') return ['system', 'achievement', 'reminder'].includes(notification.type);
    return true;
  });

  // REAL API call to mark notification as read
  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
      // Fallback to local update for UX
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // REAL API call to mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      // Fallback to local update for UX
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  // REAL API call to delete notification
  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
      if (notifications.find(n => n.id === id && !n.read)) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
      // Fallback to local update for UX
      const wasUnread = notifications.find(n => n.id === id && !n.read);
      setNotifications(notifications.filter(n => n.id !== id));
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_due':
        return { icon: Icons.Clock, color: 'bg-warning-100 text-warning-600' };
      case 'task_completed':
        return { icon: Icons.CheckCircle, color: 'bg-success-100 text-success-600' };
      case 'task_overdue':
        return { icon: Icons.ExclamationCircle, color: 'bg-danger-100 text-danger-600' };
      case 'reminder':
        return { icon: Icons.Bell, color: 'bg-primary-100 text-primary-600' };
      case 'achievement':
        return { icon: Icons.Star, color: 'bg-warning-100 text-warning-600' };
      case 'system':
        return { icon: Icons.InformationCircle, color: 'bg-secondary-100 text-secondary-600' };
      default:
        return { icon: Icons.Bell, color: 'bg-secondary-100 text-secondary-600' };
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton variant="title" className="w-48" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="card" className="h-20" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Notifications"
          description={unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          actions={
            unreadCount > 0 && (
              <Button variant="outline" onClick={handleMarkAllAsRead}>
                <Icons.Check className="w-4 h-4 mr-2" />
                Mark all as read
              </Button>
            )
          }
        />

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <EmptyState
            icon={<Icons.Bell className="w-16 h-16" />}
            title="No notifications"
            description={activeTab === 'unread' ? "You're all caught up!" : "No notifications to show"}
          />
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const { icon: Icon, color } = getNotificationIcon(notification.type);
              
              return (
                <Card
                  key={notification.id}
                  className={`p-4 transition-all ${!notification.read ? 'border-l-4 border-l-primary-500 bg-primary-50/30' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className={`font-medium ${!notification.read ? 'text-secondary-900' : 'text-secondary-700'}`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-secondary-500 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-secondary-400 mt-2">
                            {formatTimestamp(notification.created_at || notification.timestamp)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="p-1.5 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                              title="Mark as read"
                            >
                              <Icons.Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="p-1.5 text-secondary-400 hover:text-danger-600 hover:bg-danger-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Icons.Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {notification.action_url && (
                        <a
                          href={notification.action_url}
                          className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium mt-3"
                        >
                          View details
                          <Icons.ChevronRight className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Notifications;
