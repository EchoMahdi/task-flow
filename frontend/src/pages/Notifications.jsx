import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/index';
import { Card, Button, Tabs, Box, Skeleton, Typography, IconButton,Tab } from '@mui/material';
import PageHeader from '../components/ui/PageHeader';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/authService';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import M_Notifications   from '@mui/icons-material/Notifications';
import StarIcon from '@mui/icons-material/Star';
import InfoIcon from '@mui/icons-material/Info';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

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
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, []);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'system', label: 'System' },
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
        return { icon: M_Notifications , color: '#fef3c7', textColor: '#d97706' };
      case 'task_completed':
        return { icon: CheckCircleIcon, color: '#dcfce7', textColor: '#16a34a' };
      case 'task_overdue':
        return { icon: ErrorIcon, color: '#fee2e2', textColor: '#dc2626' };
      case 'reminder':
        return { icon: M_Notifications , color: '#dbeafe', textColor: '#2563eb' };
      case 'achievement':
        return { icon: StarIcon, color: '#fef3c7', textColor: '#d97706' };
      case 'system':
        return { icon: InfoIcon, color: '#f3f4f6', textColor: '#6b7280' };
      default:
        return { icon: M_Notifications , color: '#f3f4f6', textColor: '#6b7280' };
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
      <AppLayout>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
            ))}
          </Box>
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <PageHeader
          title="Notifications"
          description={unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          actions={
            unreadCount > 0 && (
              <Button variant="outlined" onClick={handleMarkAllAsRead} startIcon={<CheckIcon />}>
                Mark all as read
              </Button>
            )
          }
        />

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, value) => setActiveTab(value)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {tabs.map((tab) => (
              <Tab key={tab.id} label={tab.label} value={tab.id} />
            ))}
          </Tabs>
        </Box>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <M_Notifications  sx={{ fontSize: 32, color: 'grey.400' }} />
            </Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              No notifications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {activeTab === 'unread' ? "You're all caught up!" : "No notifications to show"}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredNotifications.map((notification) => {
              const { icon: Icon, color, textColor } = getNotificationIcon(notification.type);
              
              return (
                <Card
                  key={notification.id}
                  sx={{
                    p: 2,
                    transition: 'all 0.15s',
                    borderLeft: !notification.read ? 4 : 0,
                    borderColor: 'primary.main',
                    bgcolor: !notification.read ? 'rgba(25, 118, 210, 0.04)' : 'background.paper',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        bgcolor: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon sx={{ fontSize: 20, color: textColor }} />
                    </Box>
                    
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                        <Box>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: !notification.read ? 600 : 400,
                              color: 'text.primary',
                            }}
                          >
                            {notification.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                            {formatTimestamp(notification.created_at || notification.timestamp)}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {!notification.read && (
                            <IconButton
                              onClick={() => handleMarkAsRead(notification.id)}
                              size="small"
                              sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'primary.light' } }}
                              title="Mark as read"
                            >
                              <CheckIcon fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton
                            onClick={() => handleDelete(notification.id)}
                            size="small"
                            sx={{ color: 'text.secondary', '&:hover': { color: 'error.main', bgcolor: 'error.light' } }}
                            title="Delete"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      {notification.action_url && (
                        <Box
                          component="a"
                          href={notification.action_url}
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            fontSize: '0.875rem',
                            color: 'primary.main',
                            fontWeight: 500,
                            mt: 1.5,
                            textDecoration: 'none',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          View details
                          <ChevronRightIcon fontSize="small" />
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Card>
              );
            })}
          </Box>
        )}
      </Box>
    </AppLayout>
  );
};

export default Notifications;
