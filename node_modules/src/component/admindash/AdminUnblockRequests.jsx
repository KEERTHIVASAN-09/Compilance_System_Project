import { useState, useEffect } from "react";

function AdminUnblockRequests({ onRequestAction }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmationModal, setConfirmationModal] = useState({
    show: false,
    requestId: null,
    userName: null,
    userEmail: null,
    action: null,
    adminResponse: ""
  });
  const [responseModal, setResponseModal] = useState({
    show: false,
    requestId: null,
    userName: null,
    userReason: "",
    adminResponse: "",
    action: null
  });
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchUnblockRequests();
  }, []);

  const fetchUnblockRequests = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/block-requests/pending");
      const data = await res.json();

      if (res.ok) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error("Error fetching unblock requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const openResponseModal = (requestId, userName, userReason, action) => {
    setResponseModal({
      show: true,
      requestId,
      userName,
      userReason,
      adminResponse: "",
      action
    });
  };

  const openConfirmationModal = (requestId, userName, userEmail, action) => {
    setConfirmationModal({
      show: true,
      requestId,
      userName,
      userEmail,
      action,
      adminResponse: action === "approve" ? "Your account has been unblocked. You can now log in." : "Your request has been rejected."
    });
  };

  const closeConfirmationModal = () => {
    setConfirmationModal({
      show: false,
      requestId: null,
      userName: null,
      userEmail: null,
      action: null,
      adminResponse: ""
    });
  };

  const closeResponseModal = () => {
    setResponseModal({
      show: false,
      requestId: null,
      userName: null,
      userReason: "",
      adminResponse: "",
      action: null
    });
  };

  const openDetailsModal = (request) => {
    setSelectedRequest(request);
  };

  const closeDetailsModal = () => {
    setSelectedRequest(null);
  };

  const proceedToResponseModal = () => {
    // Find the request to get the user's reason
    const request = requests.find(r => r._id === confirmationModal.requestId);
    const userReason = request ? request.reason : "";

    openResponseModal(
      confirmationModal.requestId,
      confirmationModal.userName,
      userReason,
      confirmationModal.action
    );
    closeConfirmationModal();
  };

  const handleApproveRequest = async () => {
    try {
      const url = `http://localhost:5000/api/block-requests/${responseModal.requestId}/approve`;
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          adminResponse: responseModal.adminResponse || "Your request has been approved. You can now log in."
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Request approved successfully!");
        setRequests(requests.filter(r => r._id !== responseModal.requestId));
        closeResponseModal();
        if (onRequestAction) onRequestAction();
      } else {
        alert(data.message || "Failed to approve request");
      }
    } catch (error) {
      console.error("Error approving request:", error);
      alert("Error approving request");
    }
  };

  const handleRejectRequest = async () => {
    try {
      const url = `http://localhost:5000/api/block-requests/${responseModal.requestId}/reject`;
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          adminResponse: responseModal.adminResponse || "Your request has been rejected."
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Request rejected successfully!");
        setRequests(requests.filter(r => r._id !== responseModal.requestId));
        closeResponseModal();
        if (onRequestAction) onRequestAction();
      } else {
        alert(data.message || "Failed to reject request");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Error rejecting request");
    }
  };

  if (loading) {
    return <div className="admin-main"><h1>Loading...</h1></div>;
  }

  return (
    <div className="admin-main">
      <div className="admin-header">
        <h1>Unblock Requests</h1>
        <p>Manage user unblock requests</p>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <p>✓ No pending unblock requests</p>
        </div>
      ) : (
        <div className="requests-container">
          <div className="requests-count">
            <span className="count-badge">Pending Requests: <strong>{requests.length}</strong></span>
          </div>

          <div className="requests-table-container">
            <table className="requests-table">
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Request Reason</th>
                  <th>Requested Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request._id}>
                    <td className="user-name">{request.userName}</td>
                    <td>{request.userEmail}</td>
                    <td className="request-reason">
                      <div className="reason-preview">
                        {request.reason.length > 50 ? `${request.reason.substring(0, 50)}...` : request.reason}
                      </div>
                      <button
                        className="view-message-btn"
                        onClick={() => openDetailsModal(request)}
                      >
                        View Full Message
                      </button>
                    </td>
                    <td>{new Date(request.requestedAt).toLocaleDateString()}</td>
                    <td className="action-buttons">
                      <button
                        className="approve-btn"
                        onClick={() => openConfirmationModal(
                          request._id,
                          request.userName,
                          request.userEmail,
                          "approve"
                        )}
                      >
                        Approve
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => openConfirmationModal(
                          request._id,
                          request.userName,
                          request.userEmail,
                          "reject"
                        )}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {responseModal.show && (
        <div className="modal-overlay" onClick={closeResponseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{responseModal.action === "approve" ? "Approve Unblock Request" : "Reject Unblock Request"}</h2>
            <p className="modal-subtitle">
              User: <strong>{responseModal.userName}</strong>
            </p>
            
            <div className="request-details">
              <h4>Request Reason:</h4>
              <p className="request-text">{responseModal.userReason}</p>
            </div>

            <div className="form-group">
              <label>Admin Response</label>
              <textarea
                placeholder={responseModal.action === "approve" 
                  ? "Your account has been unblocked..." 
                  : "Your request has been rejected..."}
                value={responseModal.adminResponse}
                onChange={(e) =>
                  setResponseModal({
                    ...responseModal,
                    adminResponse: e.target.value
                  })
                }
                rows="4"
              />
            </div>

            <div className="modal-actions">
              <button
                className={responseModal.action === "approve" ? "modal-approve-btn" : "modal-reject-btn"}
                onClick={responseModal.action === "approve" ? handleApproveRequest : handleRejectRequest}
              >
                {responseModal.action === "approve" ? "Confirm Approval" : "Confirm Rejection"}
              </button>
              <button
                className="modal-cancel-btn"
                onClick={closeResponseModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedRequest && (
        <div className="modal-overlay" onClick={closeDetailsModal}>
          <div className="modal-content details-modal" onClick={e => e.stopPropagation()}>
            <h2>Unblock Request Details</h2>
            
            <div className="request-info">
              <div className="info-row">
                <label>User Name:</label>
                <span>{selectedRequest.userName}</span>
              </div>
              <div className="info-row">
                <label>Email:</label>
                <span>{selectedRequest.userEmail}</span>
              </div>
              <div className="info-row">
                <label>Requested Date:</label>
                <span>{new Date(selectedRequest.requestedAt).toLocaleString()}</span>
              </div>
              <div className="info-row">
                <label>Status:</label>
                <span className={`status-${selectedRequest.status.toLowerCase()}`}>{selectedRequest.status}</span>
              </div>
            </div>

            <div className="request-message">
              <h4>Request Message:</h4>
              <div className="message-content">
                {selectedRequest.reason}
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="modal-cancel-btn"
                onClick={closeDetailsModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmationModal.show && (
        <div className="confirmation-modal-overlay">
          <div className="confirmation-modal">
            <h3>Confirm Action</h3>
            <div className="confirmation-details">
              <p><strong>User:</strong> {confirmationModal.userName}</p>
              <p><strong>Email:</strong> {confirmationModal.userEmail}</p>
              <p><strong>Action:</strong> {confirmationModal.action === "approve" ? "Approve Unblock Request" : "Reject Unblock Request"}</p>
            </div>
            <div className="confirmation-buttons">
              <button
                className="confirm-btn"
                onClick={proceedToResponseModal}
              >
                Confirm
              </button>
              <button
                className="cancel-btn"
                onClick={closeConfirmationModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUnblockRequests;
