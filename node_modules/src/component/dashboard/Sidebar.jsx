import { useState, useEffect } from "react";

function Sidebar({ user, onMenuChange }) {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    // Check for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/notifications/unread/${user.id}`
      );
      const data = await res.json();
      if (res.ok) {
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    if (onMenuChange) {
      onMenuChange(menu);
    }
  };

  return (
    <div className="sidebar">
      <div className="profile">
        {user.photo ? (
          <img src={user.photo} alt="Profile" className="avatar-photo" />
        ) : (
          <div className="avatar">👤</div>
        )}
        <h3>Welcome,</h3>
        <p>{user.name}</p>
        <small>{user.role}</small>
      </div>

      <ul className="menu">
        <li 
          className={activeMenu === "dashboard" ? "active" : ""} 
          onClick={() => handleMenuClick("dashboard")}
        >
          <span className="menu-icon">▪</span>Dashboard
        </li>
        <li 
          className={activeMenu === "complaints" ? "active" : ""} 
          onClick={() => handleMenuClick("complaints")}
        >
          <span className="menu-icon">▪</span>My Complaints
        </li>
        <li 
          className={activeMenu === "submit" ? "active" : ""} 
          onClick={() => handleMenuClick("submit")}
        >
          <span className="menu-icon">▪</span>Submit Complaint
        </li>
        <li 
          className={activeMenu === "notifications" ? "active" : ""} 
          onClick={() => handleMenuClick("notifications")}
        >
          <span className="menu-icon">▪</span>Notifications
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </li>
        <li 
          className={activeMenu === "settings" ? "active" : ""} 
          onClick={() => handleMenuClick("settings")}
        >
          <span className="menu-icon">▪</span>Settings
        </li>
      </ul>

      <button className="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

export default Sidebar;
