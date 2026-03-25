import { useState, useEffect } from "react";

function ResolverSidebar({ user, onMenuChange }) {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [assignedCount, setAssignedCount] = useState(0);

  useEffect(() => {
    fetchAssignedCount();
    // Check for new assignments every 30 seconds
    const interval = setInterval(fetchAssignedCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAssignedCount = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/complaints/resolver/${user.id}`
      );
      const data = await res.json();
      if (res.ok) {
        // Count only "Pending" and "In Progress" complaints
        const activeComplaints = data.complaints.filter(
          c => c.status !== "Resolved"
        ).length;
        setAssignedCount(activeComplaints);
      }
    } catch (error) {
      console.error("Error fetching assigned count:", error);
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
    <div className="sidebar resolver-sidebar">
      <div className="profile">
        {user.photo ? (
          <img src={user.photo} alt="Profile" className="avatar-photo" />
        ) : (
          <div className="avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : ''}
          </div>
        )}
        <h3>Welcome,</h3>
        <p>{user.name}</p>
        <small className="resolver-badge">Resolver</small>
      </div>

      <ul className="menu">
        <li 
          className={activeMenu === "dashboard" ? "active" : ""} 
          onClick={() => handleMenuClick("dashboard")}
        >
          Dashboard
        </li>
        <li 
          className={activeMenu === "assigned" ? "active" : ""} 
          onClick={() => handleMenuClick("assigned")}
        >
          Assigned Complaints
          {assignedCount > 0 && (
            <span className="notification-badge">{assignedCount}</span>
          )}
        </li>
        <li 
          className={activeMenu === "settings" ? "active" : ""} 
          onClick={() => handleMenuClick("settings")}
        >
          Settings
        </li>
      </ul>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default ResolverSidebar;
