import { useState } from "react";

function ResolverSettings({ user, onSettingsUpdate }) {
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    photo: user.photo || ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          photo: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `http://localhost:5000/api/users/${user.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        }
      );

      if (res.ok) {
        const updatedUser = await res.json();
        setMessage("Profile updated successfully!");
        localStorage.setItem("user", JSON.stringify(updatedUser.user || updatedUser));
        onSettingsUpdate(updatedUser.user || updatedUser);
        
        setTimeout(() => {
          setMessage("");
        }, 3000);
      } else {
        setMessage("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Error updating profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-main">
      <div className="dashboard-header">
        <h1>Settings</h1>
        <p>Update your profile information</p>
      </div>

      <div className="settings-container">
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="settings-section">
            <h3>Profile Picture</h3>
            <div className="photo-upload">
              {formData.photo ? (
                <img src={formData.photo} alt="Profile" className="profile-preview" />
              ) : (
                <div className="avatar-placeholder">🔧</div>
              )}
              <div className="upload-controls">
                <label htmlFor="photo-input" className="upload-label">
                  Choose Photo
                </label>
                <input
                  type="file"
                  id="photo-input"
                  name="photo"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="photo-input"
                />
                <p className="upload-hint">Recommended: 200x200px, PNG or JPG</p>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3>Personal Information</h3>
            
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="settings-section">
            <h3>Account Information</h3>
            <div className="account-info">
              <div className="info-item">
                <label>Account Type</label>
                <p className="badge-info">{user.role}</p>
              </div>
              <div className="info-item">
                <label>User ID</label>
                <p>{user.id}</p>
              </div>
              <div className="info-item">
                <label>Member Since</label>
                <p>{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {message && (
            <div className={`message ${message.includes("success") ? "success-message" : "error-message"}`}>
              {message}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResolverSettings;
