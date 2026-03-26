import { useState } from "react";

function SubmitComplaint({ user, onComplaintSubmitted }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !category) {
      setMessage("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/complaints/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          title,
          description,
          category,
          priority
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Complaint submitted successfully!");
        setTitle("");
        setDescription("");
        setCategory("");
        setPriority("Medium");
        // no resolver selected by user; complaint will be unassigned for admin to assign

        // Call parent function to refresh dashboard
        if (onComplaintSubmitted) {
          onComplaintSubmitted();
        }

        // Clear message after 3 seconds
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ " + (data.message || "Failed to submit complaint"));
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("❌ Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-main">
      <h1>Submit a Complaint</h1>
      <p>We're here to help! Please describe your complaint below.</p>

      <div className="form-container">
        <div className="form-section">
          <h2>Your Information</h2>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={user.name}
              disabled
              className="input-disabled"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="input-disabled"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-section">
          <h2>Complaint Details</h2>
          
          <div className="form-group">
            <label>Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select Category</option>
              <option value="Internet">Internet</option>
              <option value="Water">Water</option>
              <option value="Power">Power</option>
              <option value="Gas">Gas</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Complaint Title *</label>
            <input
              type="text"
              placeholder="Brief title of your complaint"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              placeholder="Please describe your complaint in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="6"
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="form-group">
            <p style={{fontSize: '0.95em', color: '#666'}}>
              Your complaint will be submitted to the admin team. Admins will review and assign a resolver if needed.
            </p>
          </div>

          {message && (
            <div className={`message ${message.includes("✅") ? "success" : "error"}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Complaint"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SubmitComplaint;
