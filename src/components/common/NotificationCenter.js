import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaBell, 
  FaEnvelope, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaTrophy,
  FaClock,
  FaTimes,
  FaEye,
  FaTrash
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('http://localhost:5000/api/student/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        // Fallback to mock data for demo
        setNotifications(generateMockNotifications());
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications(generateMockNotifications());
    } finally {
      setLoading(false);
    }
  };

  const generateMockNotifications = () => [
    {
      id: 1,
      type: 'test_completion',
      title: 'Test Completed Successfully!',
      message: 'Congratulations! You have completed your Web Development Assessment Test with a score of 85%.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      priority: 'high',
      actionUrl: '/student/results',
      icon: 'FaCheckCircle',
      color: 'green'
    },
    {
      id: 2,
      type: 'certificate',
      title: 'Certificate Available',
      message: 'Your certificate for the Web Development Assessment Test is now available for download.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      read: false,
      priority: 'medium',
      actionUrl: '/student/certificates',
      icon: 'FaTrophy',
      color: 'yellow'
    },
    {
      id: 3,
      type: 'payment',
      title: 'Payment Confirmed',
      message: 'Your payment of ₹295 has been successfully processed. You can now access your test.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      priority: 'medium',
      actionUrl: '/student/dashboard',
      icon: 'FaCheckCircle',
      color: 'blue'
    },
    {
      id: 4,
      type: 'reminder',
      title: 'Test Reminder',
      message: 'Don\'t forget to complete your Web Development Assessment Test. You have 3 attempts remaining.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      priority: 'low',
      actionUrl: '/student/dashboard',
      icon: 'FaClock',
      color: 'orange'
    },
    {
      id: 5,
      type: 'achievement',
      title: 'New Achievement Unlocked!',
      message: 'You have earned the "Top Performer" achievement for scoring in the top 10% of all candidates.',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      priority: 'high',
      actionUrl: '/student/progress',
      icon: 'FaTrophy',
      color: 'purple'
    },
    {
      id: 6,
      type: 'security',
      title: 'Security Warning',
      message: 'Please ensure you follow the test guidelines. Multiple tab switches may result in test auto-submission.',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      priority: 'high',
      actionUrl: '/student/dashboard',
      icon: 'FaExclamationTriangle',
      color: 'red'
    }
  ];

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/student/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
        toast.success('Notification marked as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Update locally for demo
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      toast.success('Notification marked as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/student/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        toast.success('Notification deleted');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Update locally for demo
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      toast.success('Notification deleted');
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/student/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Update locally for demo
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      toast.success('All notifications marked as read');
    }
  };

  const getIconComponent = (iconName) => {
    const iconMap = {
      'FaCheckCircle': FaCheckCircle,
      'FaTrophy': FaTrophy,
      'FaClock': FaClock,
      'FaExclamationTriangle': FaExclamationTriangle,
      'FaEnvelope': FaEnvelope
    };
    return iconMap[iconName] || FaBell;
  };

  const getPriorityColor = (priority) => {
    const colorMap = {
      high: 'text-red-600',
      medium: 'text-yellow-600',
      low: 'text-blue-600'
    };
    return colorMap[priority] || 'text-gray-600';
  };

  const getTypeColor = (color) => {
    const colorMap = {
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800',
      orange: 'bg-orange-100 text-orange-800',
      purple: 'bg-purple-100 text-purple-800',
      red: 'bg-red-100 text-red-800'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800';
  };

  const filteredNotifications = notifications.filter(notification => {
    if (showUnreadOnly && notification.read) return false;
    if (filter !== 'all' && notification.type !== filter) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-primary-dark">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <FaBell className="text-2xl text-amber-500 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-primary-dark">Notifications</h1>
                <p className="text-sm text-gray-600">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <FaCheckCircle />
                <span>Mark All Read</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-amber-200 p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Types</option>
                <option value="test_completion">Test Completion</option>
                <option value="certificate">Certificate</option>
                <option value="payment">Payment</option>
                <option value="reminder">Reminder</option>
                <option value="achievement">Achievement</option>
                <option value="security">Security</option>
              </select>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showUnreadOnly}
                  onChange={(e) => setShowUnreadOnly(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                <span className="text-sm text-gray-700">Show unread only</span>
              </label>
            </div>
            
            <div className="text-sm text-gray-600">
              {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-amber-200 p-8 text-center">
              <FaBell className="text-4xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No notifications</h3>
              <p className="text-gray-600">
                {showUnreadOnly ? 'You have no unread notifications.' : 'You have no notifications to display.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const IconComponent = getIconComponent(notification.icon);
              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-lg shadow-sm border border-amber-200 p-6 transition-all duration-200 hover:shadow-md ${
                    !notification.read ? 'border-l-4 border-l-amber-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`p-3 rounded-full ${getTypeColor(notification.color)}`}>
                        <IconComponent className="text-xl" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                          {!notification.read && (
                            <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                              New
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.color)}`}>
                            {notification.type.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{notification.message}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{new Date(notification.timestamp).toLocaleDateString()}</span>
                            <span>{new Date(notification.timestamp).toLocaleTimeString()}</span>
                            <span className={getPriorityColor(notification.priority)}>
                              {notification.priority.toUpperCase()} Priority
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-full hover:bg-blue-100"
                                title="Mark as read"
                              >
                                <FaEye />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-red-600 hover:text-red-800 transition-colors p-2 rounded-full hover:bg-red-100"
                              title="Delete notification"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter; 