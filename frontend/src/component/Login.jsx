import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [blockedInfo, setBlockedInfo] = useState(null);
  const [unblockReason, setUnblockReason] = useState("");
  const [requestingUnblock, setRequestingUnblock] = useState(false);

  const handleLogin = async () => {
    
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedRole = role.trim();

    if (!trimmedRole || !trimmedEmail || !trimmedPassword) {
      alert("Please fill all fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: trimmedEmail, 
          password: trimmedPassword, 
          role: trimmedRole 
        })
      });

      const data = await res.json();

      if (!res.ok) {
        // If account is blocked, allow user to submit an unblock request
        if (res.status === 403 && data && data.isBlocked) {
          setBlockedInfo({ userId: data.userId, reason: data.blockedReason || "" });
          return;
        }

        alert(data.message || "Login failed");
        return;
      }

      if (data.user.role !== trimmedRole) {
        alert("Role does not match");
        return;
      }
      localStorage.setItem("user", JSON.stringify(data.user));

      setTimeout(() => {
        if (trimmedRole === "user") {
          navigate("/dashboard");
        } else if (trimmedRole === "resolver") {
          navigate("/resolver-dashboard");
        } else if (trimmedRole === "admin") {
          navigate("/admin-dashboard");
        }
      }, 100);

    } catch (error) {
      console.error("Login error:", error);
      alert("Server error. Please try again later.");
    }
  };

    const handleRequestUnblock = async () => {
      if (!blockedInfo || !blockedInfo.userId) return alert('Invalid unblock request');
      if (!unblockReason.trim()) return alert('Please provide a reason');

      setRequestingUnblock(true);
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_BASE}/api/block-requests/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: blockedInfo.userId, reason: unblockReason.trim() })
        });
        const data = await res.json();
        if (res.ok) {
          alert('Unblock request submitted. Admin will review it.');
          setBlockedInfo(null);
          setUnblockReason('');
        } else {
          alert(data.message || 'Failed to submit unblock request');
        }
      } catch (error) {
        console.error('Unblock request error:', error);
        alert('Server error. Please try again later.');
      } finally {
        setRequestingUnblock(false);
      }
    };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-main-title">LOGIN</h1>
        <p className="auth-subtitle">Welcome back, please login</p>

        <label>Role</label>
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="">Select Role</option>
          <option value="user">User</option>
          <option value="resolver">Resolver</option>
          <option value="admin">Admin</option>
        </select>

        <label>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>Login</button>

        {blockedInfo && (
          <div style={{marginTop: '16px', padding: '12px', border: '1px solid #f5c6cb', background: '#fff5f5'}}>
            <h4 style={{margin: '0 0 8px 0'}}>Your account is blocked</h4>
            <p style={{margin: '0 0 8px 0', color: '#721c24'}}>Reason: {blockedInfo.reason || 'No reason provided by admin'}</p>
            <label>Request Unblock (optional message)</label>
            <textarea
              value={unblockReason}
              onChange={e => setUnblockReason(e.target.value)}
              rows={3}
              placeholder="Explain why you should be unblocked..."
              style={{width: '100%', marginBottom: '8px'}}
            />
            <button onClick={handleRequestUnblock} disabled={requestingUnblock} style={{marginRight: '8px'}}>
              {requestingUnblock ? 'Submitting...' : 'Request Unblock'}
            </button>
          </div>
        )}

        <div className="auth-footer">
          Don’t have an account? <Link to="/signup">Register</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
