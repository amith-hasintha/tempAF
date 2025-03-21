import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Notifications.css';
import UserHeader from './UserHeader';
import UserFooter from './UserFooter';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/notifications/${id}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications(); // Refresh the list after marking as read
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <><><UserHeader /><div className="notifications-container">
          <h1>Notifications</h1>
          {notifications.length === 0 ? (
              <p>No notifications found.</p>
          ) : (
              <ul className="notifications-list">
                  {notifications.map((notification) => (
                      <li key={notification._id} className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
                          <div className="notification-content">
                              <p>{notification.message}</p>
                              <small>{new Date(notification.createdAt).toLocaleString()}</small>
                          </div>
                          {!notification.read && (
                              <button onClick={() => handleMarkAsRead(notification._id)} className="mark-as-read-btn">
                                  Mark as Read
                              </button>
                          )}
                      </li>
                  ))}
              </ul>
          )}
      </div></><UserFooter /></>
  );
};

export default Notifications;