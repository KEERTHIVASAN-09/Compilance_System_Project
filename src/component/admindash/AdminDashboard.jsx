import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminNotificationBar from "./AdminNotificationBar";
import AdminDashboardHome from "./AdminDashboardHome";
import AdminUsers from "./AdminUsers";
import AdminManageComplaints from "./AdminManageComplaints";
import AdminUnblockRequests from "./AdminUnblockRequests";
import AdminSettings from "./AdminSettings";
import "./AdminDashboard.css";

function AdminDashboard() {
  let user = JSON.parse(localStorage.getItem("user"));
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [refreshNotification, setRefreshNotification] = useState(0);

  if (!user || user.role !== "admin") {
    window.location.href = "/login";
    return null;
  }

  const handleMenuChange = (menu) => {
    setActiveMenu(menu);
  };

  const handleNotificationRefresh = () => {
    setRefreshNotification(prev => prev + 1);
  };

  return (
    <div className="admin-dashboard-container">
      <AdminSidebar user={user} onMenuChange={handleMenuChange} />
      <div className="admin-main-content">
        <AdminNotificationBar onMenuChange={handleMenuChange} refreshTrigger={refreshNotification} />
        <div className="admin-content-area">
          {activeMenu === "dashboard" && <AdminDashboardHome />}
          {activeMenu === "users" && <AdminUsers />}
          {activeMenu === "complaints" && <AdminManageComplaints />}
          {activeMenu === "unblock-requests" && <AdminUnblockRequests onRequestAction={handleNotificationRefresh} />}
          {activeMenu === "settings" && <AdminSettings user={user} />}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;