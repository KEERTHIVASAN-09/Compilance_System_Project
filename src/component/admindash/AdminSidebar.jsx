import "./AdminDashboard.css";

function AdminSidebar({ user, onMenuChange }) {
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="admin-sidebar">
      <div className="profile">
        <div className="avatar">
          {user.photo ? (
            <img src={user.photo} alt={user.name} />
          ) : (
            <div className="avatar-placeholder">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <h3>{user.name}</h3>
        <p>{user.email}</p>
        <div className="admin-badge">Administrator</div>
      </div>

      <ul className="menu">
        <li
          className={window.location.pathname === "/admin-dashboard" ? "active" : ""}
          onClick={() => onMenuChange("dashboard")}
        >
          <span className="menu-icon"></span>
          Dashboard
        </li>
        <li
          className={window.location.pathname === "/admin-users" ? "active" : ""}
          onClick={() => onMenuChange("users")}
        >
          <span className="menu-icon"></span>
          User Management
        </li>
        <li
          className={window.location.pathname === "/admin-manage-complaints" ? "active" : ""}
          onClick={() => onMenuChange("complaints")}
        >
          <span className="menu-icon"></span>
          Manage Complaints
        </li>
        <li
          className={window.location.pathname === "/admin-unblock-requests" ? "active" : ""}
          onClick={() => onMenuChange("unblock-requests")}
        >
          <span className="menu-icon"></span>
          Unblock Requests
        </li>
        <li
          className={window.location.pathname === "/admin-settings" ? "active" : ""}
          onClick={() => onMenuChange("settings")}
        >
          <span className="menu-icon"></span>
          Settings
        </li>
      </ul>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <span className="menu-icon"></span>
          Logout
        </button>
      </div>
    </div>
  );
}

export default AdminSidebar;