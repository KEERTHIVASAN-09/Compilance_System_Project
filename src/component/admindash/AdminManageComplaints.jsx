import { useState, useEffect } from "react";

function AdminManageComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    complaintId: null,
    complaintTitle: null,
    comments: ""
  });
  const [assignModal, setAssignModal] = useState({
    show: false,
    complaintId: null,
    complaintTitle: null,
    category: null
  });
  const [resolversForAssign, setResolversForAssign] = useState([]);
  const [loadingResolversForAssign, setLoadingResolversForAssign] = useState(false);
  const [selectedResolverId, setSelectedResolverId] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/complaints/all/with-users");
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

  const openDeleteModal = (complaintId, complaintTitle) => {
    setDeleteModal({
      show: true,
      complaintId,
      complaintTitle,
      comments: ""
    });
  };

  const openAssignModal = (complaintId, complaintTitle, category) => {
    setAssignModal({ show: true, complaintId, complaintTitle, category });
    setSelectedResolverId("");
    fetchResolversForCategory(category);
  };

  const closeAssignModal = () => {
    setAssignModal({ show: false, complaintId: null, complaintTitle: null, category: null });
    setResolversForAssign([]);
    setSelectedResolverId("");
  };

  const fetchResolversForCategory = async (category) => {
    if (!category) return;
    setLoadingResolversForAssign(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/complaints/resolvers/by-specialty/${encodeURIComponent(category)}`
      );
      const data = await res.json();
      if (res.ok) {
        setResolversForAssign(data.resolvers || []);
      } else {
        setResolversForAssign([]);
      }
    } catch (error) {
      console.error("Error fetching resolvers for assign:", error);
      setResolversForAssign([]);
    } finally {
      setLoadingResolversForAssign(false);
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      show: false,
      complaintId: null,
      complaintTitle: null,
      comments: ""
    });
  };

  const handleDeleteComplaint = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/complaints/delete/${deleteModal.complaintId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comments: deleteModal.comments })
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Complaint deleted successfully!");
        setComplaints(complaints.filter(c => c._id !== deleteModal.complaintId));
        closeDeleteModal();
      } else {
        alert(data.message || "Failed to delete complaint");
      }
    } catch (error) {
      console.error("Error deleting complaint:", error);
      alert("Error deleting complaint");
    }
  };

  const handleAssignResolver = async () => {
    if (!assignModal.complaintId || !selectedResolverId) return alert('Please choose a resolver to assign');
    setAssigning(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/complaints/assign/${assignModal.complaintId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resolverId: selectedResolverId })
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert('Complaint assigned successfully');
        // update list locally
        setComplaints(prev => prev.map(c => c._id === data.complaint._id ? data.complaint : c));
        closeAssignModal();
      } else {
        alert(data.message || 'Failed to assign complaint');
      }
    } catch (error) {
      console.error('Error assigning complaint:', error);
      alert('Error assigning complaint');
    } finally {
      setAssigning(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#f59e0b';
      case 'In Progress': return '#3b82f6';
      case 'Resolved': return '#10b981';
      case 'Declined': return '#ef4444';
      case 'Dismissed': return '#6b7280';
      default: return '#9ca3af';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Internet': return '#7c3aed';
      case 'Water': return '#0ea5e9';
      case 'Power': return '#fbbf24';
      case 'Gas': return '#06b6d4';
      case 'Maintenance': return '#8b5cf6';
      case 'Other': return '#6b7280';
      default: return '#9ca3af';
    }
  };

  if (loading) {
    return <div className="admin-main"><h1>Loading...</h1></div>;
  }

  return (
    <div className="admin-main">
      <div className="admin-header">
        <h1>Manage Complaints</h1>
        <p>View and manage all system complaints</p>
      </div>

      <div className="complaints-container">
        <div className="complaints-stats">
          <div className="stat-badge">
            <span className="stat-label">Total Complaints:</span>
            <span className="stat-value">{complaints.length}</span>
          </div>
          <div className="stat-badge">
            <span className="stat-label">Pending:</span>
            <span className="stat-value">{complaints.filter(c => c.status === 'Pending').length}</span>
          </div>
          <div className="stat-badge">
            <span className="stat-label">In Progress:</span>
            <span className="stat-value">{complaints.filter(c => c.status === 'In Progress').length}</span>
          </div>
          <div className="stat-badge">
            <span className="stat-label">Resolved:</span>
            <span className="stat-value">{complaints.filter(c => c.status === 'Resolved').length}</span>
          </div>
        </div>

        <div className="complaints-table-container">
          <table className="complaints-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Complainer</th>
                <th>Category</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((complaint) => (
                <tr key={complaint._id}>
                  <td className="complaint-title">{complaint.title}</td>
                  <td>{complaint.userId?.name || 'Unknown'}</td>
                  <td>
                    <span
                      className="badge category-badge"
                      style={{ backgroundColor: getCategoryColor(complaint.category) }}
                    >
                      {complaint.category}
                    </span>
                  </td>
                  <td>
                    <span
                      className="badge status-badge"
                      style={{ backgroundColor: getStatusColor(complaint.status) }}
                    >
                      {complaint.status}
                    </span>
                  </td>
                  <td>{complaint.priority}</td>
                  <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                  <td>
                        {!complaint.resolverId && (
                          <button
                            className="assign-btn"
                            onClick={() => openAssignModal(complaint._id, complaint.title, complaint.category)}
                            style={{marginRight: '8px'}}
                          >
                            Assign
                          </button>
                        )}
                        <button
                          className="delete-btn"
                          onClick={() => openDeleteModal(complaint._id, complaint.title)}
                        >
                          Delete
                        </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {deleteModal.show && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Delete Complaint</h2>
            <p className="modal-subtitle">
              Are you sure you want to delete: <strong>"{deleteModal.complaintTitle}"</strong>
            </p>
            <p className="modal-warning">⚠️ This action cannot be undone.</p>
            
            <div className="form-group">
              <label>Comments (Optional)</label>
              <textarea
                placeholder="Enter reason for deletion..."
                value={deleteModal.comments}
                onChange={(e) =>
                  setDeleteModal({
                    ...deleteModal,
                    comments: e.target.value
                  })
                }
                rows="4"
              />
            </div>

            <div className="modal-actions">
              <button
                className="modal-delete-btn"
                onClick={handleDeleteComplaint}
              >
                Confirm Delete
              </button>
              <button
                className="modal-cancel-btn"
                onClick={closeDeleteModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {assignModal.show && (
        <div className="assign-modal-overlay" onClick={closeAssignModal}>
          <div className="assign-modal-content" onClick={e => e.stopPropagation()}>
            <h2>Assign Resolver</h2>
            <p className="assign-modal-subtitle">Assign a resolver for: <strong>"{assignModal.complaintTitle}"</strong></p>
            <p style={{color: '#6b7280', fontSize: '13px', marginBottom: '20px'}}>Category: <strong style={{color: '#1f2937'}}>{assignModal.category}</strong></p>

            <div className="form-group">
              <label>Select Resolver</label>
              {loadingResolversForAssign ? (
                <p style={{color: '#6b7280', fontSize: '14px', marginTop: '8px'}}>Loading resolvers...</p>
              ) : (
                <select className="resolver-select" value={selectedResolverId} onChange={e => setSelectedResolverId(e.target.value)}>
                  <option value="">Select Resolver</option>
                  {resolversForAssign.length > 0 ? (
                    resolversForAssign.map(r => (
                      <option key={r._id} value={r._id}>{r.name} • {r.email} • {r.resolverRole}</option>
                    ))
                  ) : (
                    <option disabled>No resolvers with this specialty</option>
                  )}
                </select>
              )}
            </div>

            <div className="assign-modal-actions">
              <button className="assign-modal-confirm" onClick={handleAssignResolver} disabled={assigning}>
                {assigning ? 'Assigning...' : 'Assign'}
              </button>
              <button className="assign-modal-close" onClick={closeAssignModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminManageComplaints;
