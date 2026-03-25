import { useState, useEffect } from "react";

function AdminDashboardHome() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalResolvers: 0,
    totalAdmins: 0,
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      // Fetch users stats
      const usersRes = await fetch("http://localhost:5000/api/auth/all-users");
      const usersData = await usersRes.json();

      if (usersRes.ok) {
        const users = usersData.users;
        const totalUsers = users.filter(u => u.role === 'user').length;
        const totalResolvers = users.filter(u => u.role === 'resolver').length;
        const totalAdmins = users.filter(u => u.role === 'admin').length;

        // Fetch complaints stats
        const complaintsRes = await fetch("http://localhost:5000/api/complaints/admin/system-stats");
        const complaintsData = await complaintsRes.json();

        if (complaintsRes.ok) {
          setStats({
            totalUsers,
            totalResolvers,
            totalAdmins,
            totalComplaints: complaintsData.stats.totalComplaints,
            pendingComplaints: complaintsData.stats.pendingComplaints,
            resolvedComplaints: complaintsData.stats.resolvedComplaints
          });
        } else {
          setStats({
            totalUsers,
            totalResolvers,
            totalAdmins,
            totalComplaints: 0,
            pendingComplaints: 0,
            resolvedComplaints: 0
          });
        }
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-main"><h1>Loading...</h1></div>;
  }

  return (
    <div className="admin-main">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>System overview and management</p>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <h3>{stats.totalResolvers}</h3>
            <p>Resolvers</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <h3>{stats.totalAdmins}</h3>
            <p>Administrators</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <h3>{stats.totalComplaints}</h3>
            <p>Total Complaints</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <h3>{stats.pendingComplaints}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <h3>{stats.resolvedComplaints}</h3>
            <p>Resolved</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardHome;