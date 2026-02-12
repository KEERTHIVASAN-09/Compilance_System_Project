import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./auth.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

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
      const res = await fetch("http://localhost:5000/api/auth/login", {
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

        <div className="auth-footer">
          Don’t have an account? <Link to="/signup">Register</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
