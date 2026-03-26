import { useState } from "react";
import { Link } from "react-router-dom";
import "./Auth.css";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [resolverRole, setResolverRole] = useState("");

  const handleRegister = async () => {
    // Trim inputs
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedRole = role.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword || !trimmedRole) {
      alert("Please fill all fields");
      return;
    }

    // If registering as a resolver, require a resolver role/specialty
    if (trimmedRole.toLowerCase() === 'resolver' && !resolverRole.trim()) {
      alert("Please select a resolver role/specialty");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      alert("Please enter a valid email address");
      return;
    }

    // Password validation
    if (trimmedPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: trimmedName, 
          email: trimmedEmail, 
          password: trimmedPassword, 
          role: trimmedRole,
          resolverRole: resolverRole.trim() || null
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registration successful! Please login to continue.");
        // Clear form
        setName("");
        setEmail("");
        setPassword("");
        setRole("");
        setResolverRole("");
        // Redirect to login
        window.location.href = "/login";
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Server error. Please try again later.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-main-title">REGISTER</h1>
        <p className="auth-subtitle">
          Create account to raise or resolve complaints
        </p>

        <label>Role</label>
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="">Select Role</option>
          <option value="user">User</option>
          <option value="resolver">Resolver</option>
          <option value="admin">Admin</option>
        </select>

        {role === 'resolver' && (
          <>
            <label>Resolver Role / Specialty</label>
            <select value={resolverRole} onChange={e => setResolverRole(e.target.value)}>
              <option value="">Select Resolver Role</option>
              <option value="Internet">Internet</option>
              <option value="Water">Water</option>
              <option value="Power">Power</option>
              <option value="Gas">Gas</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Other">Other</option>
            </select>
          </>
        )}

        <label>Full Name</label>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={e => setName(e.target.value)}
        />

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
          placeholder="Create password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button onClick={handleRegister}>Register</button>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
