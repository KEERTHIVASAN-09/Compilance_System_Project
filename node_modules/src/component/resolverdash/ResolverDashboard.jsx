import { useState } from "react";
import ResolverSidebar from "./ResolverSidebar";
import ResolverDashboardHome from "./ResolverDashboardHome";
import AssignedComplaints from "./AssignedComplaints";
import ResolverSettings from "./ResolverSettings";
import "./ResolverDashboard.css";

function ResolverDashboard() {
  let user = JSON.parse(localStorage.getItem("user"));
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentUser, setCurrentUser] = useState(user);

  if (!user || user.role !== "resolver") {
    window.location.href = "/login";
    return null;
  }

  const handleMenuChange = (menu) => {
    setActiveMenu(menu);
  };

  const handleComplaintUpdated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleSettingsUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <div className="dashboard-container">
      <ResolverSidebar user={currentUser} onMenuChange={handleMenuChange} />
      {activeMenu === "dashboard" && (
        <ResolverDashboardHome key={refreshKey} user={currentUser} onComplaintUpdated={handleComplaintUpdated} />
      )}
      {activeMenu === "assigned" && (
        <AssignedComplaints user={currentUser} onComplaintUpdated={handleComplaintUpdated} />
      )}
      {activeMenu === "settings" && (
        <ResolverSettings user={currentUser} onSettingsUpdate={handleSettingsUpdate} />
      )}
    </div>
  );
}

export default ResolverDashboard;
