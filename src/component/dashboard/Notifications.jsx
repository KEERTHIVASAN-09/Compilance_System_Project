import { useState, useEffect } from "react";
import "./Notifications.css";

function Notifications({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, resolved

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/notifications/user/${user.id}`
      );
      const data = await res.json();

      if (res.ok) {
        setNotifications(data.notifications);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatDetailedDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(
        `http://localhost:5000/api/notifications/mark-read/${notificationId}`,
        {
          method: "PUT"
        }
      );
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await fetch(
        `http://localhost:5000/api/notifications/delete/${notificationId}`,
        {
          method: "DELETE"
        }
      );
      fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(
        `http://localhost:5000/api/notifications/mark-all-read/${user.id}`,
        {
          method: "PUT"
        }
      );
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "RESOLVED":
        return "✓";
      case "IN_PROGRESS":
        return "⏳";
      case "UNDER_REVIEW":
        return "👁️";
      default:
        return "📬";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "RESOLVED":
        return "#a9e64d";
      case "IN_PROGRESS":
        return "#ffeaa7";
      case "UNDER_REVIEW":
        return "#81ecec";
      default:
        return "#cbd5e0";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "RESOLVED":
        return "Resolved";
      case "IN_PROGRESS":
        return "In Progress";
      case "UNDER_REVIEW":
        return "Under Review";
      default:
        return "Update";
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.isRead;
    if (filter === "resolved") return notif.type === "RESOLVED";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="dashboard-main">
        <div className="loading">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-main">
      <div className="notifications-header">
        <div>
          <h1>Notifications</h1>
          <p>Track updates on your complaints</p>
        </div>
        {unreadCount > 0 && (
          <button className="mark-all-read-btn" onClick={markAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      <div className="notification-filters">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({notifications.length})
        </button>
        <button
          className={`filter-btn ${filter === "unread" ? "active" : ""}`}
          onClick={() => setFilter("unread")}
        >
          Unread ({unreadCount})
        </button>
        <button
          className={`filter-btn ${filter === "resolved" ? "active" : ""}`}
          onClick={() => setFilter("resolved")}
        >
          Resolved (
          {notifications.filter((n) => n.type === "RESOLVED").length})
        </button>
      </div>

      {filteredNotifications.length > 0 ? (
        <div className="notifications-list">
          {filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-card ${!notification.isRead ? "unread" : ""}`}
            >
              <div className="notification-type-icon" style={{ color: getTypeColor(notification.type) }}>
                {getTypeIcon(notification.type)}
              </div>

              <div className="notification-content">
                <div className="notification-header">
                  <span
                    className="notification-type-badge"
                    style={{ backgroundColor: getTypeColor(notification.type) }}
                  >
                    {getTypeLabel(notification.type)}
                  </span>
                  <span className="notification-time">
                    {formatDate(notification.createdAt)}
                  </span>
                </div>

                <h3 className="notification-title">
                  {notification.complaintTitle}
                </h3>

                <div className="notification-details">
                  <p className="notification-message">
                    {notification.resolutionMessage}
                  </p>

                  <div className="resolver-info">
                    <strong>Handled by:</strong> {notification.resolverName}
                  </div>

                  {notification.resolverComments && (
                    <div className="resolver-comments">
                      <strong>Resolution Details:</strong>
                      <p>{notification.resolverComments}</p>
                    </div>
                  )}

                  <div className="notification-meta">
                    <span className="resolved-date">
                      <strong>Updated:</strong>{" "}
                      {formatDetailedDate(notification.resolvedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="notification-actions">
                {!notification.isRead && (
                  <button
                    className="mark-read-btn"
                    onClick={() => markAsRead(notification._id)}
                    title="Mark as read"
                  >
                    📖
                  </button>
                )}
                <button
                  className="delete-btn"
                  onClick={() => deleteNotification(notification._id)}
                  title="Delete notification"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-notifications">
          <p>📬 No notifications yet</p>
          <p className="text-muted">
            {filter === "unread"
              ? "All your notifications have been read"
              : "When your complaints are updated, notifications will appear here"}
          </p>
        </div>
      )}
    </div>
  );
}

export default Notifications;
