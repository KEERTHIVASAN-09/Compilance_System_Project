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
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [showDismissConfirm, setShowDismissConfirm] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [dismissReason, setDismissReason] = useState("");

  useEffect(() => {
    fetchResolverComplaints();
    fetchResolverStats();
  }, [user]);

  const fetchResolverComplaints = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/complaints/resolver/${user.id}/assigned`
      );
      const data = await res.json();
      
      if (res.ok) {
        console.log(`Fetched ${data.count || 0} complaints assigned to ${user.name}`);
        setComplaints(data.complaints);
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
    }
  };

  const fetchResolverStats = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/complaints/resolver/${user.id}/stats`
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
      case 'Pending': return '#f59e0b';
      case 'In Progress': return '#3b82f6';
      case 'Resolved': return '#10b981';
      case 'Declined': return '#ef4444';
      case 'Dismissed': return '#6b7280';
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
    
    // Require comments before resolving
    if (newStatus === "Resolved" && !resolverComment.trim()) {
      alert("Please add resolution comments before marking as resolved");
      return;
    }
    
    setUpdatingStatus(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/complaints/resolver/${selectedComplaint._id}/resolve`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: newStatus,
            resolverComments: resolverComment,
            resolverId: user.id
          })
        }
      );

      if (res.ok) {
        const updatedComplaint = await res.json();
        const updatedComplaintData = updatedComplaint.complaint;
        setSelectedComplaint(updatedComplaintData);
        
        // Refresh the list
        await fetchResolverComplaints();
        fetchResolverStats();
        
        if (newStatus === "Resolved") {
          alert("Complaint marked as resolved successfully!");
          setTimeout(() => {
            setSelectedComplaint(null);
            setResolverComment("");
          }, 1500);
        } else {
          alert("Complaint status updated successfully!");
        }
        
        onComplaintUpdated();
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

  const handleDeclineComplaint = async () => {
    if (!selectedComplaint) return;
    
    if (!declineReason.trim()) {
      alert("Please provide a reason for declining this complaint");
      return;
    }
    
    setUpdatingStatus(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/complaints/resolver/${selectedComplaint._id}/resolve`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "Declined",
            resolverComments: declineReason,
            resolverId: user.id
          })
        }
      );

      if (res.ok) {
        const updatedComplaint = await res.json();
        setSelectedComplaint(updatedComplaint.complaint);
        
        // Refresh the list
        await fetchResolverComplaints();
        fetchResolverStats();
        
        alert("Complaint declined successfully!");
        setTimeout(() => {
          setSelectedComplaint(null);
          setResolverComment("");
          setDeclineReason("");
          setShowDeclineConfirm(false);
        }, 1500);
        
        onComplaintUpdated();
      } else {
        alert("Failed to decline complaint");
      }
    } catch (error) {
      console.error("Error declining complaint:", error);
      alert("Error declining complaint");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDismissComplaint = async () => {
    if (!selectedComplaint) return;
    
    if (!dismissReason.trim()) {
      alert("Please provide a reason for dismissing this complaint");
      return;
    }
    
    setUpdatingStatus(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/complaints/resolver/${selectedComplaint._id}/resolve`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "Dismissed",
            resolverComments: dismissReason,
            resolverId: user.id
          })
        }
      );

      if (res.ok) {
        const updatedComplaint = await res.json();
        setSelectedComplaint(updatedComplaint.complaint);
        
        // Refresh the list
        await fetchResolverComplaints();
        fetchResolverStats();
        
        alert("Complaint dismissed successfully!");
        setTimeout(() => {
          setSelectedComplaint(null);
          setResolverComment("");
          setDismissReason("");
          setShowDismissConfirm(false);
        }, 1500);
        
        onComplaintUpdated();
      } else {
        alert("Failed to dismiss complaint");
      }
    } catch (error) {
      console.error("Error dismissing complaint:", error);
      alert("Error dismissing complaint");
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
                <label>Name</label>
                <p>{selectedComplaint.userId?.name || 'Unknown'}</p>
              </div>
              <div className="detail-item">
                <label>Email</label>
                <p>{selectedComplaint.userId?.email || 'Unknown'}</p>
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
            {selectedComplaint.status !== "Resolved" && selectedComplaint.status !== "Declined" && selectedComplaint.status !== "Dismissed" && (
              <div style={{marginTop: '20px'}}>
                {!showDeclineConfirm && !showDismissConfirm ? (
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px'}}>
                    <button 
                      className="btn btn-resolved"
                      onClick={() => handleUpdateStatus("Resolved")}
                      disabled={updatingStatus}
                      style={{backgroundColor: '#28a745', width: '100%'}}
                    >
                      {updatingStatus ? "Resolving..." : "Resolve"}
                    </button>
                    <button 
                      className="btn btn-hold"
                      onClick={() => setShowDeclineConfirm(true)}
                      disabled={updatingStatus}
                      style={{backgroundColor: '#ffc107', width: '100%', color: '#000'}}
                    >
                      Hold
                    </button>
                    <button 
                      className="btn btn-dismiss"
                      onClick={() => setShowDismissConfirm(true)}
                      disabled={updatingStatus}
                      style={{backgroundColor: '#6c757d', width: '100%'}}
                    >
                      Dismiss
                    </button>
                  </div>
                ) : showDeclineConfirm ? (
                  <div style={{backgroundColor: '#fff3cd', padding: '15px', borderRadius: '8px', border: '1px solid #ffc107'}}>
                    <h4 style={{margin: '0 0 10px 0'}}>Why are you putting this on hold?</h4>
                    <textarea
                      className="comment-textarea"
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      placeholder="Provide reason for putting on hold (e.g., waiting for user info, pending approval)..."
                      rows="4"
                      style={{width: '100%', marginBottom: '10px'}}
                    />
                    <div style={{display: 'flex', gap: '10px'}}>
                      <button 
                        className="btn"
                        onClick={handleDeclineComplaint}
                        disabled={updatingStatus}
                        style={{backgroundColor: '#ffc107', color: '#000', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1}}
                      >
                        {updatingStatus ? "Holding..." : "Confirm Hold"}
                      </button>
                      <button 
                        className="btn"
                        onClick={() => {
                          setShowDeclineConfirm(false);
                          setDeclineReason("");
                        }}
                        disabled={updatingStatus}
                        style={{backgroundColor: '#6c757d', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1}}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : showDismissConfirm ? (
                  <div style={{backgroundColor: '#e2e3e5', padding: '15px', borderRadius: '8px', border: '1px solid #bdbebf'}}>
                    <h4 style={{margin: '0 0 10px 0'}}>Why are you dismissing this complaint?</h4>
                    <textarea
                      className="comment-textarea"
                      value={dismissReason}
                      onChange={(e) => setDismissReason(e.target.value)}
                      placeholder="Provide reason for dismissing (e.g., duplicate, already resolved, insufficient info)..."
                      rows="4"
                      style={{width: '100%', marginBottom: '10px'}}
                    />
                    <div style={{display: 'flex', gap: '10px'}}>
                      <button 
                        className="btn"
                        onClick={handleDismissComplaint}
                        disabled={updatingStatus}
                        style={{backgroundColor: '#6c757d', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1}}
                      >
                        {updatingStatus ? "Dismissing..." : "Confirm Dismiss"}
                      </button>
                      <button 
                        className="btn"
                        onClick={() => {
                          setShowDismissConfirm(false);
                          setDismissReason("");
                        }}
                        disabled={updatingStatus}
                        style={{backgroundColor: '#6c757d', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1}}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
            {selectedComplaint.status === "Resolved" && (
              <div className="resolved-info" style={{backgroundColor: '#d4edda', padding: '15px', borderRadius: '8px', marginTop: '20px'}}>
                <p style={{margin: '0', fontSize: '1.1em'}}>✅ <strong>This complaint has been resolved</strong></p>
                {selectedComplaint.resolvedAt && (
                  <p style={{margin: '8px 0 0 0', color: '#666', fontSize: '0.95em'}}>
                    Resolved on: {formatDate(selectedComplaint.resolvedAt)}
                  </p>
                )}
              </div>
            )}
            {selectedComplaint.status === "Declined" && (
              <div className="resolved-info" style={{backgroundColor: '#f8d7da', padding: '15px', borderRadius: '8px', marginTop: '20px'}}>
                <p style={{margin: '0', fontSize: '1.1em'}}>❌ <strong>This complaint has been declined</strong></p>
                {selectedComplaint.resolverComments && (
                  <p style={{margin: '8px 0 0 0', color: '#666', fontSize: '0.95em'}}>
                    Reason: {selectedComplaint.resolverComments}
                  </p>
                )}
              </div>
            )}
            {selectedComplaint.status === "Dismissed" && (
              <div className="resolved-info" style={{backgroundColor: '#e2e3e5', padding: '15px', borderRadius: '8px', marginTop: '20px'}}>
                <p style={{margin: '0', fontSize: '1.1em'}}>⊘ <strong>This complaint has been dismissed</strong></p>
                {selectedComplaint.resolverComments && (
                  <p style={{margin: '8px 0 0 0', color: '#666', fontSize: '0.95em'}}>
                    Reason: {selectedComplaint.resolverComments}
                  </p>
                )}
              </div>
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
          <div className="stat-content">
            <h3>{stats.assigned}</h3>
            <p>Assigned Complaints</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>{stats.inProgress}</h3>
            <p>In Progress</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>{stats.resolved}</h3>
            <p>Resolved</p>
          </div>
        </div>
        <div className="stat-card">
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
                  <div>
                    <h4>{complaint.title}</h4>
                    <div className="complaint-submitter">By: {complaint.userId?.name || 'Unknown'}</div>
                  </div>
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
