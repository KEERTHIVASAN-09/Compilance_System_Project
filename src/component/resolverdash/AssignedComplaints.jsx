import { useState, useEffect } from "react";

function AssignedComplaints({ user, onComplaintUpdated }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [resolverComment, setResolverComment] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchAssignedComplaints();
  }, []);

  const fetchAssignedComplaints = async () => {
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
        fetchAssignedComplaints();
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
            </div>

            <div className="detail-section">
              <h3>Complainer Information</h3>
              <div className="detail-item">
                <label>User ID</label>
                <p>{selectedComplaint.userId}</p>
              </div>
              <div className="detail-item">
                <label>Last Updated</label>
                <p>{formatDate(selectedComplaint.updatedAt)}</p>
              </div>
            </div>
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
            {selectedComplaint.status === "Resolved" && (
              <div className="resolved-info">
                <p>✅ This complaint has been resolved</p>
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
        <h1>Assigned Complaints</h1>
        <p>View and manage all complaints assigned to you ({filteredComplaints.length})</p>
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
                    <strong>{complaint.title}</strong>
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
