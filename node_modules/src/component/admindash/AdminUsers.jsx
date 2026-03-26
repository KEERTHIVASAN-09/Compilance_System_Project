import { useState, useEffect } from "react";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin"
  });
  const [registering, setRegistering] = useState(false);
  const [blockModal, setBlockModal] = useState({
    show: false,
    userId: null,
    userName: null,
    reason: "",
    isBlocking: false
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/all-users");
      const data = await res.json();

      if (res.ok) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const existingAdmins = users.filter(u => u.role === 'admin').length;
  const isFirstAdmin = existingAdmins === 0;

  const handleRegisterAdmin = async (e) => {
    e.preventDefault();
    setRegistering(true);

    try {
      let headers = { "Content-Type": "application/json" };
      
      // Only add authorization header if there are existing admins
      if (existingAdmins > 0) {
        const user = JSON.parse(localStorage.getItem("user"));
        headers["Authorization"] = `Bearer ${user.id}`;
      }

      const res = await fetch("http://localhost:5000/api/auth/admin/register", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "User registered successfully!");
        setFormData({ name: "", email: "", password: "", role: "admin" });
        setShowRegisterForm(false);
        fetchUsers(); // Refresh the users list
      } else {
        alert(data.message || "Failed to register user");
      }
    } catch (error) {
      console.error("Error registering admin:", error);
      alert("Error registering admin");
    } finally {
      setRegistering(false);
    }
  };

  const openBlockModal = (userId, userName) => {
    setBlockModal({
      show: true,
      userId,
      userName,
      reason: "",
      isBlocking: false
    });
  };

  const closeBlockModal = () => {
    setBlockModal({
      show: false,
      userId: null,
      userName: null,
      reason: "",
      isBlocking: false
    });
  };

  const handleBlockUser = async () => {
    setBlockModal({ ...blockModal, isBlocking: true });
    try {
      const res = await fetch(
        `http://localhost:5000/api/auth/user/${blockModal.userId}/block`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ blockedReason: blockModal.reason })
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("User blocked successfully!");
        setUsers(users.map(u => u._id === blockModal.userId ? { ...u, isBlocked: true } : u));
        closeBlockModal();
      } else {
        alert(data.message || "Failed to block user");
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      alert("Error blocking user");
    } finally {
      setBlockModal({ ...blockModal, isBlocking: false });
    }
  };

  const handleUnblockUser = async (userId) => {
    if (!window.confirm("Are you sure you want to unblock this user?")) return;
    
    try {
      const res = await fetch(
        `http://localhost:5000/api/auth/user/${userId}/unblock`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" }
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("User unblocked successfully!");
        setUsers(users.map(u => u._id === userId ? { ...u, isBlocked: false } : u));
      } else {
        alert(data.message || "Failed to unblock user");
      }
    } catch (error) {
      console.error("Error unblocking user:", error);
      alert("Error unblocking user");
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#dc2626';
      case 'resolver': return '#059669';
      case 'user': return '#2563eb';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return <div className="admin-main"><h1>Loading...</h1></div>;
  }

  return (
    <div className="admin-main">
      <div className="admin-header">
        <h1>User Management</h1>
        <p>Manage system users and administrators</p>
        <button
          className="register-admin-btn"
          onClick={() => setShowRegisterForm(!showRegisterForm)}
        >
          {showRegisterForm ? 'Cancel' : (isFirstAdmin ? '+ Register First Admin' : '+ Register Admin')}
        </button>
      </div>

      {showRegisterForm && (
        <div className="register-form-container">
          <form onSubmit={handleRegisterAdmin} className="register-form">
            <h3>{isFirstAdmin ? 'Register First Administrator' : 'Register New Administrator'}</h3>
            {isFirstAdmin && (
              <div className="first-admin-notice">
                <p><strong>Welcome!</strong> This appears to be your first time setting up the system. 
                Registering the first admin will allow you to manage the entire compliance system.</p>
              </div>
            )}
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter full name"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter email address"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Enter password"
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
              >
                <option value="admin">Admin</option>
                <option value="resolver">Resolver</option>
                <option value="user">User</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" disabled={registering}>
                {registering ? "Registering..." : "Register Admin"}
              </button>
              <button type="button" onClick={() => setShowRegisterForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="users-section">
        <h2>All Users ({users.length})</h2>
        <div className="users-table-container">
          <table className="users-table">
            <head>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th>Action</th>
              </tr>
            </head>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span
                      className="role-badge"
                      style={{ backgroundColor: getRoleColor(user.role) }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: user.isBlocked ? "#dc2626" : "#10b981",
                        color: "white",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "600"
                      }}
                    >
                      {user.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="user-actions-container">
                      {user.isBlocked ? (
                        <button
                          className="unblock-user-btn"
                          onClick={() => handleUnblockUser(user._id)}
                          title="Unblock this user"
                        >
                          ✓ Unblock
                        </button>
                      ) : (
                        <button
                          className="block-user-btn"
                          onClick={() => openBlockModal(user._id, user.name)}
                          title="Block this user"
                        >
                          ✕ Block
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {blockModal.show && (
        <div className="block-modal-overlay" onClick={closeBlockModal}>
          <div className="block-modal-content" onClick={e => e.stopPropagation()}>
            <h2>Block User</h2>
            <p className="block-modal-subtitle">
              Are you sure you want to block: <strong>"{blockModal.userName}"</strong>
            </p>
            <div className="block-modal-warning">
              ⚠️ This user will not be able to log in. They can request to be unblocked from their account settings.
            </div>
            
            <div className="form-group">
              <label>Reason for blocking</label>
              <textarea
                className="block-modal-reason-textarea"
                placeholder="Enter reason for blocking this user..."
                value={blockModal.reason}
                onChange={(e) =>
                  setBlockModal({
                    ...blockModal,
                    reason: e.target.value
                  })
                }
                rows="4"
              />
            </div>

            <div className="block-modal-actions">
              <button
                className="block-modal-confirm"
                onClick={handleBlockUser}
                disabled={blockModal.isBlocking}
              >
                {blockModal.isBlocking ? "Blocking..." : "Confirm Block"}
              </button>
              <button
                className="block-modal-close"
                onClick={closeBlockModal}
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

export default AdminUsers;