import { useState, useEffect } from "react";

function MyComplaints({ user, onViewDetails }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/complaints/user/${user.id}`);
      const data = await res.json();
      
      if (res.ok) {
        setComplaints(data.complaints);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const formatRef = (id) => {
    if (!id) return '';
    return `CMP-${id.slice(-6).toUpperCase()}`;
  };

  const normalizeLabel = (label) => {
    if (!label) return '';
    // Strip leading bullets, punctuation, and excess whitespace
    return label
      .toString()
      .replace(/^[^\p{L}\p{N}]+/u, '')
      .replace(/[•·–—]+/g, ' ')
      .trim();
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return '#fab1a0';
      case 'In Progress': return '#ffeaa7';
      case 'Resolved': return '#a9e64d';
      default: return '#cbd5e0';
    }
  };

  if (selectedComplaint) {
    return (
      <div className="dashboard-main">
        <button className="back-btn" onClick={() => setSelectedComplaint(null)}>
          ← Back to My Complaints
        </button>

        <div className="complaint-details">
          <div className="detail-header">
            <div>
              <h1>{selectedComplaint.title}</h1>
              <p className="detail-id">Reference: {formatRef(selectedComplaint._id)}</p>
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
              <h3>Resolution Details</h3>
              <div className="resolution-box">
                {selectedComplaint.resolverName && (
                  <div className="resolver-header">
                    <strong>Handled by:</strong> {selectedComplaint.resolverName}
                  </div>
                )}
                {selectedComplaint.resolvedAt && (
                  <div className="resolved-date-info">
                    <strong>Resolved on:</strong> {formatDate(selectedComplaint.resolvedAt)}
                  </div>
                )}
                <div className="comments-content">
                  <strong>Comments:</strong>
                  <p>{selectedComplaint.resolverComments}</p>
                </div>
              </div>
            </div>
          )}

          <div className="action-buttons">
            <button className="back-btn" onClick={() => setSelectedComplaint(null)}>
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-main">
      <h1>My Complaints</h1>
      <p>View all your submitted complaints and their status</p>

      {loading ? (
        <div className="loading">Loading complaints...</div>
      ) : complaints.length > 0 ? (
        <div className="complaints-list">
          {complaints.map((complaint) => (
            <div
              key={complaint._id}
              className="complaint-card"
              onClick={() => setSelectedComplaint(complaint)}
            >
              <div className="complaint-card-header">
                <div>
                  <h3>{complaint.title}</h3>
                </div>
                <span 
                  className="complaint-status"
                  style={{ backgroundColor: getStatusColor(complaint.status) }}
                >
                  {complaint.status}
                </span>
              </div>

              <div className="complaint-card-body">
                <p>{complaint.description.substring(0, 150)}...</p>
              </div>

              <div className="complaint-card-footer">
                <div className="complaint-meta">
                  <span className="category-badge">{normalizeLabel(complaint.category)}</span>
                  <span className={`priority-small priority-${complaint.priority.toLowerCase()}`}>
                    {normalizeLabel(complaint.priority)} Priority
                  </span>
                </div>
                {(() => {
                  const parts = formatDateParts(complaint.createdAt);
                  return (
                    <span className="date">
                      <span className="date-day">{parts.day}</span>
                      <span className="date-time">{parts.time}</span>
                    </span>
                  );
                })()}
              </div>

              <div className="view-details-link">
                View Details →
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-complaints">
          <p>No complaints submitted yet</p>
          <p className="text-muted">Submit your first complaint using the "Submit Complaint" option</p>
        </div>
      )}
    </div>
  );
}

export default MyComplaints;
