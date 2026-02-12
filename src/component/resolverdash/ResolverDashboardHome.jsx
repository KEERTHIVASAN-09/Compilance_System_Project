import { useState, useEffect } from "react";

function ResolverDashboardHome({ user, onComplaintUpdated }) {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolverComment, setResolverComment] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchResolverComplaints();
    fetchResolverStats();
  }, []);

  const fetchResolverComplaints = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/complaints/resolver/${user.id}`
      );
      const data = await res.json();
      
      if (res.ok) {
        setComplaints(data.complaints);
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
    }
  };

  const fetchResolverStats = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/complaints/resolver/stats/${user.id}`
      );
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
    setResolverComment(complaint.resolverComments || "");
  };

  const handleBackToDashboard = () => {
    setSelectedComplaint(null);
    setResolverComment("");
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedComplaint) return;
    
    setUpdatingStatus(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/complaints/${selectedComplaint._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: newStatus,
            resolverComments: resolverComment,
            resolverId: user.id,
            resolverName: user.name
          })
        }
      );

      if (res.ok) {
        const updatedComplaint = await res.json();
        setSelectedComplaint(updatedComplaint.complaint);
        fetchResolverComplaints();
        fetchResolverStats();
        onComplaintUpdated();
        alert("Complaint updated successfully!");
      } else {
        alert("Failed to update complaint");
      }
    } catch (error) {
      console.error("Error updating complaint:", error);
      alert("Error updating complaint");
    } finally {
      setUpdatingStatus(false);
    }
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
                <p>{selectedComplaint.priority}</p>
              </div>
              <div className="detail-item">
                <label>Created Date</label>
                <p>{formatDate(selectedComplaint.createdAt)}</p>
              </div>
            </div>

            <div className="detail-section">
              <h3>Complainer Information</h3>
              <div className="detail-item">
                <label>User ID</label>
                <p>{selectedComplaint.userId}</p>
              </div>
            </div>
          </div>

          <div className="detail-section full-width">
            <h3>Description</h3>
            <p className="description-text">{selectedComplaint.description}</p>
          </div>

          <div className="detail-section full-width">
            <h3>Resolver Comments</h3>
            <textarea
              className="comment-textarea"
              value={resolverComment}
              onChange={(e) => setResolverComment(e.target.value)}
              placeholder="Add your comments here..."
              rows="5"
            />
          </div>

          <div className="action-buttons">
            {selectedComplaint.status !== "Resolved" && (
              <>
                {selectedComplaint.status === "Pending" && (
                  <button 
                    className="btn btn-progress"
                    onClick={() => handleUpdateStatus("In Progress")}
                    disabled={updatingStatus}
                  >
                    {updatingStatus ? "Updating..." : "Start Working"}
                  </button>
                )}
                {selectedComplaint.status === "In Progress" && (
                  <button 
                    className="btn btn-resolved"
                    onClick={() => handleUpdateStatus("Resolved")}
                    disabled={updatingStatus}
                  >
                    {updatingStatus ? "Updating..." : "Mark as Resolved"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-main">
      <div className="dashboard-header">
        <h1>Resolver Dashboard</h1>
        <p>Manage and resolve complaints efficiently</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{stats.assigned}</h3>
            <p>Assigned Complaints</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.inProgress}</h3>
            <p>In Progress</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.resolved}</h3>
            <p>Resolved</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
      </div>

      <div className="complaints-section">
        <h2>Recent Complaints</h2>
        {complaints.length === 0 ? (
          <div className="no-complaints">
            <p>No complaints assigned yet</p>
          </div>
        ) : (
          <div className="complaints-list">
            {complaints.slice(0, 5).map((complaint) => (
              <div 
                key={complaint._id} 
                className="complaint-card"
                onClick={() => handleViewComplaint(complaint)}
              >
                <div className="complaint-card-header">
                  <h4>{complaint.title}</h4>
                  <span 
                    className="status-badge" 
                    style={{ backgroundColor: getStatusColor(complaint.status) }}
                  >
                    {complaint.status}
                  </span>
                </div>
                <p className="complaint-description">{complaint.description.substring(0, 100)}...</p>
                <div className="complaint-meta">
                  <span className="category">Category: {complaint.category}</span>
                  <span className="priority">Priority: {complaint.priority}</span>
                  <span className="date">{formatDate(complaint.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResolverDashboardHome;
