import { useState, useEffect } from "react";

function AdminNotificationBar({ onMenuChange, refreshTrigger }) {
  const [pendingRequests, setPendingRequests] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingRequestsCount();
  }, [refreshTrigger]);

  const fetchPendingRequestsCount = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/block-requests/pending");
      const data = await res.json();

      if (res.ok) {
        setPendingRequests(data.requests.length);
      }
    } catch (error) {
      console.error("Error fetching pending requests count:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || pendingRequests === 0) {
    return null; // Don't show notification bar if loading or no pending requests
  }

  return (
    <div className="admin-notification-bar">
      <div className="notification-content">
        <div className="notification-icon">
          <span>🔔</span>
        </div>
        <div className="notification-text">
          <strong>{pendingRequests}</strong> user{pendingRequests > 1 ? 's' : ''} requesting unblock access
        </div>
        <button
          className="notification-action-btn"
          onClick={() => onMenuChange("unblock-requests")}
        >
          View Requests
        </button>
      </div>
    </div>
  );
}

export default AdminNotificationBar;