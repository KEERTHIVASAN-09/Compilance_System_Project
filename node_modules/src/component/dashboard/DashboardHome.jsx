import { useState, useEffect } from "react";

function DashboardHome({ user, activeMenu }) {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    resolved: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    fetchComplaints();
    fetchStats();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/complaints/user/${user.id}`);
      const data = await res.json();
      
      if (res.ok) {
        setComplaints(data.complaints);
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/complaints/stats/${user.id}`);
      const data = await res.json();
      
      if (res.ok) {
        setStats(data.stats);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const formatDateParts = (dateString) => {
    if (!dateString) return { day: '', time: '' };
    const date = new Date(dateString);
    const day = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).toUpperCase();
    const time = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).toUpperCase();
    return { day, time };
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return '#fab1a0';
      case 'In Progress': return '#ffeaa7';
      case 'Resolved': return '#a9e64d';
      default: return '#cbd5e0';
    }
  };

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
  };

  const handleBackToDashboard = () => {
    setSelectedComplaint(null);
  };

  if (loading) {
    return <div className="dashboard-main"><h1>Loading...</h1></div>;
  }

  if (selectedComplaint) {
    return (
      <div className="dashboard-main">
        <button className="back-btn" onClick={handleBackToDashboard}>
          ← Back to Dashboard
        </button>

        <div className="complaint-details">
          <div className="detail-header">
            <div>
              <h1>{selectedComplaint.title}</h1>
              <p className="detail-id">Complaint ID: #{selectedComplaint._id.substring(0, 8).toUpperCase()}</p>
            </div>
            <span 
              className="status-badge" 
              style={{ backgroundColor: getStatusColor(selectedComplaint.status) }}
            >
              {selectedComplaint.status}
            </span>
          </div>

          <div className="detail-grid">
            <div className="detail-section">
              <h3>Complaint Information</h3>
              <div className="detail-item">
                <label>Category</label>
                <p>{selectedComplaint.category}</p>
              </div>
              <div className="detail-item">
                <label>Priority</label>
                <p>
                  <span className={`priority-badge priority-${selectedComplaint.priority.toLowerCase()}`}>
                    {selectedComplaint.priority}
                  </span>
                </p>
              </div>
              <div className="detail-item">
                <label>Submitted Date</label>
                <p>{formatDate(selectedComplaint.createdAt)}</p>
              </div>
              <div className="detail-item">
                <label>Last Updated</label>
                <p>{formatDate(selectedComplaint.updatedAt)}</p>
              </div>
            </div>

            <div className="detail-section">
              <h3>Your Information</h3>
              <div className="detail-item">
                <label>Name</label>
                <p>{user.name}</p>
              </div>
              <div className="detail-item">
                <label>Email</label>
                <p>{user.email}</p>
              </div>
              <div className="detail-item">
                <label>Role</label>
                <p className="capitalize">{user.role}</p>
              </div>
            </div>
          </div>

          <div className="detail-section full-width">
            <h3>Description</h3>
            <div className="description-box">
              {selectedComplaint.description}
            </div>
          </div>

          {selectedComplaint.resolverComments && (
            <div className="detail-section full-width">
              <h3>Resolver Comments</h3>
              <div className="comments-box">
                {selectedComplaint.resolverComments}
              </div>
            </div>
          )}

          <div className="action-buttons">
            <button className="back-btn" onClick={handleBackToDashboard}>
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-main">
      <div className="dashboard-header">
        {user.photo && (
          <img src={user.photo} alt="Profile" className="dashboard-user-photo" />
        )}
        <div className="dashboard-header-text">
          <h1>Dashboard</h1>
          <p>Hello, {user.name}! Here's an overview of your complaints.</p>
        </div>
      </div>

      {/* STATS */}
      <div className="stats">
        {[
          { label: "Total", value: stats.total },
          { label: "In Progress", value: stats.inProgress },
          { label: "Resolved", value: stats.resolved },
          { label: "Pending", value: stats.pending }
        ].map((stat, index) => (
          <div className="card" key={index}>
            <h3>{stat.label}</h3>
            <p>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* RECENT COMPLAINTS */}
      <div className="table-box">
        <h2>Recent Complaints ({complaints.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th style={{ textAlign: 'right' }}>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {complaints.length > 0 ? (
              complaints.map((complaint) => (
                <tr key={complaint._id}>
                  <td>{complaint.title}</td>
                  <td>{complaint.category}</td>
                  <td className="date-cell">
                    {(() => {
                      const parts = formatDateParts(complaint.createdAt);
                      return (
                        <span className="date-only">{parts.day}</span>
                      );
                    })()}
                  </td>
                  <td>
                    <span className={`status ${complaint.status.toLowerCase().replace(' ', '-')}`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="view-btn"
                      onClick={() => handleViewComplaint(complaint)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                  No complaints found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DashboardHome;
