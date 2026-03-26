import { useState } from "react";
import Sidebar from "./Sidebar";
import DashboardHome from "./DashboardHome";
import SubmitComplaint from "./SubmitComplaint";
import MyComplaints from "./MyComplaints";
import Notifications from "./Notifications";
import Settings from "./Settings";
import "./Dashboard.css";

function UserDashboard() {
  let user = JSON.parse(localStorage.getItem("user"));
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentUser, setCurrentUser] = useState(user);

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  const handleMenuChange = (menu) => {
    setActiveMenu(menu);
  };

  const handleComplaintSubmitted = () => {
    // Refresh the dashboard after complaint is submitted
    setActiveMenu("dashboard");
    setRefreshKey(prev => prev + 1);
  };

  const handleSettingsUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  return (
    <div className="dashboard-container">
      <Sidebar user={currentUser} onMenuChange={handleMenuChange} />
      {activeMenu === "dashboard" && (
        <DashboardHome key={refreshKey} user={currentUser} activeMenu={activeMenu} />
      )}
      {activeMenu === "complaints" && (
        <MyComplaints user={currentUser} />
      )}
      {activeMenu === "notifications" && (
        <Notifications user={currentUser} />
      )}
      {activeMenu === "submit" && (
        <SubmitComplaint user={currentUser} onComplaintSubmitted={handleComplaintSubmitted} />
      )}
      {activeMenu === "settings" && (
        <Settings user={currentUser} onSettingsUpdate={handleSettingsUpdate} />
      )}
    </div>
  );
}

export default UserDashboard;
