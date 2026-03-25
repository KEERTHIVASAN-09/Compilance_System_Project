import { useState, useEffect } from "react";

function AssignedComplaints({ user, onComplaintUpdated }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [resolverComment, setResolverComment] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [assigningResolver, setAssigningResolver] = useState(null);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [showDismissConfirm, setShowDismissConfirm] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [dismissReason, setDismissReason] = useState("");

  useEffect(() => {
    fetchAllComplaints();
  }, [user]);

  const fetchAllComplaints = async () => {
    setLoading(true);
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
    } finally {
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
      case 'Declined': return '#d63031';
      case 'Dismissed': return '#636e72';
      default: return '#cbd5e0';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return '#ee5a6f';
      case 'Medium': return '#ffa502';
      case 'Low': return '#a29bfe';
      default: return '#cbd5e0';
    }
  };

  const filteredComplaints = filterStatus === "all" 
    ? complaints 
    : complaints.filter(c => c.status === filterStatus);

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setResolverComment(complaint.resolverComments || "");
  };

  const handleBackToList = () => {
    setSelectedComplaint(null);
    setResolverComment("");
  };

  const handleAssignToMe = async () => {
    if (!selectedComplaint) return;
    
    setAssigningResolver(true);
    try {
      // First, assign the complaint to resolver
      const assignRes = await fetch(
        `http://localhost:5000/api/complaints/assign/${selectedComplaint._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resolverId: user.id
          })
        }
      );

      if (assignRes.ok) {
        // Then, automatically move to "In Progress" status
        const statusRes = await fetch(
          `http://localhost:5000/api/complaints/resolver/${selectedComplaint._id}/resolve`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "In Progress",
              resolverId: user.id
            })
          }
        );

        if (statusRes.ok) {
          const data = await statusRes.json();
          setSelectedComplaint(data.complaint);
          fetchAllComplaints();
          onComplaintUpdated();
          alert("✓ Complaint assigned! Now you can resolve, decline, or dismiss it.");
        } else {
          alert("Complaint assigned but status update failed");
        }
      } else {
        alert("Failed to assign complaint");
      }
    } catch (error) {
      console.error("Error assigning complaint:", error);
      alert("Error assigning complaint");
    } finally {
      setAssigningResolver(false);
    }
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
        await fetchAllComplaints();
        
        if (newStatus === "Resolved") {
          alert("✅ Complaint marked as resolved successfully!");
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
        await fetchAllComplaints();
        
        alert("❌ Complaint declined successfully!");
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
        await fetchAllComplaints();
        
        alert("⊘ Complaint dismissed successfully!");
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
        <button className="back-btn" onClick={handleBackToList}>
          ← Back to List
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
                <p style={{ color: getPriorityColor(selectedComplaint.priority), fontWeight: 'bold' }}>
                  {selectedComplaint.priority}
                </p>
              </div>
              <div className="detail-item">
                <label>Status</label>
                <p>{selectedComplaint.status}</p>
              </div>
              <div className="detail-item">
                <label>Created Date</label>
                <p>{formatDate(selectedComplaint.createdAt)}</p>
              </div>
              {selectedComplaint.status === "Resolved" && selectedComplaint.resolvedAt && (
                <div className="detail-item">
                  <label>Resolved Date</label>
                  <p>{formatDate(selectedComplaint.resolvedAt)}</p>
                </div>
              )}
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
              <div className="detail-item">
                <label>Last Updated</label>
                <p>{formatDate(selectedComplaint.updatedAt)}</p>
              </div>
            </div>

            {selectedComplaint.resolverId && (
              <div className="detail-section">
                <h3>Resolver Information</h3>
                <div className="detail-item">
                  <label>Assigned Resolver</label>
                  <p>{selectedComplaint.resolverName || user.name}</p>
                </div>
              </div>
            )}
          </div>

          <div className="detail-section full-width">
            <h3>Complaint Description</h3>
            <p className="description-text">{selectedComplaint.description}</p>
          </div>

          <div className="detail-section full-width">
            <h3>Resolver Comments</h3>
            <textarea
              className="comment-textarea"
              value={resolverComment}
              onChange={(e) => setResolverComment(e.target.value)}
              placeholder="Add your resolution comments here..."
              rows="6"
            />
          </div>

          <div className="action-buttons">
            {!selectedComplaint.resolverId && (
              <button 
                className="btn btn-assign"
                onClick={handleAssignToMe}
                disabled={assigningResolver}
                style={{backgroundColor: '#4a90e2', marginRight: '10px'}}
              >
                {assigningResolver ? "Assigning..." : "✓ Assign to Me"}
              </button>
            )}
            {selectedComplaint.resolverId && selectedComplaint.status !== "Resolved" && selectedComplaint.status !== "Declined" && selectedComplaint.status !== "Dismissed" && (
              <div style={{marginTop: '20px'}}>
                {!showDeclineConfirm && !showDismissConfirm ? (
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px'}}>
                    <button 
                      className="btn btn-resolved"
                      onClick={() => handleUpdateStatus("Resolved")}
                      disabled={updatingStatus}
                      style={{backgroundColor: '#28a745', width: '100%'}}
                    >
                      {updatingStatus ? "Resolving..." : "✓ Resolve"}
                    </button>
                    <button 
                      className="btn btn-hold"
                      onClick={() => setShowDeclineConfirm(true)}
                      disabled={updatingStatus}
                      style={{backgroundColor: '#ffc107', width: '100%', color: '#000'}}
                    >
                      ⏸ Hold
                    </button>
                    <button 
                      className="btn btn-dismiss"
                      onClick={() => setShowDismissConfirm(true)}
                      disabled={updatingStatus}
                      style={{backgroundColor: '#6c757d', width: '100%'}}
                    >
                      ⊘ Dismiss
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
        <h1>My Assigned Complaints</h1>
        <p>View and manage complaints assigned to you ({filteredComplaints.length})</p>
      </div>

      <div className="filter-section">
        <label htmlFor="status-filter">Filter by Status:</label>
        <select 
          id="status-filter"
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Complaints</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Declined">Declined</option>
          <option value="Dismissed">Dismissed</option>
        </select>
      </div>

      {filteredComplaints.length === 0 ? (
        <div className="no-complaints">
          <p>No complaints found</p>
        </div>
      ) : (
        <div className="complaints-table-container">
          <table className="complaints-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map((complaint) => (
                <tr key={complaint._id} className="complaint-row">
                  <td className="title-cell">
                    <div>
                      <strong>{complaint.title}</strong>
                      <div style={{fontSize: '0.85em', color: '#666', marginTop: '4px'}}>By: {complaint.userId?.name || 'Unknown'}</div>
                    </div>
                  </td>
                  <td>{complaint.category}</td>
                  <td>
                    <span className="priority-badge" style={{ backgroundColor: getPriorityColor(complaint.priority) }}>
                      {complaint.priority}
                    </span>
                  </td>
                  <td>
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(complaint.status) }}>
                      {complaint.status}
                    </span>
                  </td>
                  <td>{formatDate(complaint.createdAt)}</td>
                  <td>
                    <button 
                      className="view-btn"
                      onClick={() => handleViewComplaint(complaint)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AssignedComplaints;
