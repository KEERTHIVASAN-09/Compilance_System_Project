import { useState } from "react";

function AdminSettings({ user, onSettingsUpdate }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    photo: user.photo || ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [pwdData, setPwdData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setMessage("Profile updated successfully!");
        localStorage.setItem("user", JSON.stringify(updatedUser.user || updatedUser));
        onSettingsUpdate(updatedUser.user || updatedUser);
        setTimeout(() => setMessage(""), 3000);
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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPwdData({ ...pwdData, [name]: value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/users/${user.id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwdData.currentPassword, newPassword: pwdData.newPassword })
      });
      if (res.ok) {
        setMessage("Password updated successfully.");
        setPwdData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => setMessage(""), 3000);
      } else {
        const err = await res.text();
        setMessage(err || "Failed to update password.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error updating password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-main">
      <div className="dashboard-header">
        <h1>Settings</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="settings-container">
        <div className="settings-tabs">
          <button className={`tab ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>Profile</button>
          <button className={`tab ${activeTab === "password" ? "active" : ""}`} onClick={() => setActiveTab("password")}>Password</button>
          <button className={`tab ${activeTab === "photo" ? "active" : ""}`} onClick={() => setActiveTab("photo")}>Photo</button>
        </div>

        {activeTab === "profile" && (
          <form onSubmit={handleSubmit} className="settings-form">
            <div className="settings-section">
              <h3>Edit Profile</h3>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="form-input" disabled />
                <small className="upload-hint">Email cannot be changed</small>
              </div>

              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="form-input" required />
              </div>

              <div className="form-group">
                <label>Role</label>
                <input className="form-input" value={user.role} disabled />
              </div>
            </div>

            <div className="form-actions">
              {message && <div className={`message ${message.includes("success") ? "success-message" : "error-message"}`}>{message}</div>}
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? "Saving..." : "Update Profile"}</button>
            </div>
          </form>
        )}

        {activeTab === "password" && (
          <form onSubmit={handlePasswordSubmit} className="settings-form">
            <div className="settings-section">
              <h3>Change Password</h3>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input type="password" id="currentPassword" name="currentPassword" value={pwdData.currentPassword} onChange={handlePasswordChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input type="password" id="newPassword" name="newPassword" value={pwdData.newPassword} onChange={handlePasswordChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" value={pwdData.confirmPassword} onChange={handlePasswordChange} className="form-input" required />
              </div>

              <div className="password-tips">
                <h4>Password Guidelines</h4>
                <ul>
                  <li>Use at least 8 characters</li>
                  <li>Include uppercase and lowercase letters</li>
                  <li>Include numbers and special characters (e.g., @, #, $)</li>
                  <li>Avoid using common words or personal information</li>
                </ul>
              </div>
            </div>

            <div className="form-actions">
              {message && <div className={`message ${message.includes("success") ? "success-message" : "error-message"}`}>{message}</div>}
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? "Saving..." : "Save Password"}</button>
            </div>
          </form>
        )}

        {activeTab === "photo" && (
          <div className="settings-form">
            <div className="settings-section">
              <h3>Profile Picture</h3>
              <div className="photo-upload">
                {formData.photo && (
                  <img src={formData.photo} alt="Profile" className="photo-preview" />
                )}
                <div className="upload-controls">
                  <label htmlFor="photo-input" className="upload-label">Choose Photo</label>
                  <input type="file" id="photo-input" name="photo" accept="image/*" onChange={handlePhotoChange} className="photo-input" />
                  <small className="upload-hint">Recommended: 200x200px, PNG or JPG, Max size: 2MB</small>
                  <div style={{ marginTop: 20 }}>
                    <button className="btn-primary" onClick={async (e) => {
                      e.preventDefault();
                      if (!formData.photo) {
                        setMessage("Please select a photo first.");
                        return;
                      }
                      setLoading(true);
                      setMessage("");
                      try {
                        const res = await fetch(`http://localhost:5000/api/users/${user.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ photo: formData.photo })
                        });
                        if (res.ok) {
                          const updatedUser = await res.json();
                          setMessage("Photo updated successfully!");
                          localStorage.setItem("user", JSON.stringify(updatedUser.user || updatedUser));
                          onSettingsUpdate(updatedUser.user || updatedUser);
                          setTimeout(() => setMessage(""), 2500);
                        } else {
                          setMessage("Failed to update photo.");
                        }
                      } catch (err) {
                        console.error(err);
                        setMessage("Error updating photo.");
                      } finally {
                        setLoading(false);
                      }
                    }}>{loading ? "Saving..." : "Upload Photo"}</button>
                  </div>
                </div>

                <div className="photo-guidelines">
                  <h4>Photo Guidelines</h4>
                  <ul>
                    <li>Use a clear, professional photo</li>
                    <li>Ensure your face is clearly visible</li>
                    <li>Use neutral background</li>
                    <li>Supported formats: JPG, PNG, GIF, WebP</li>
                  </ul>
                </div>
              </div>
            </div>
            {message && <div className={`message ${message.includes("success") ? "success-message" : "error-message"}`} style={{ marginTop: 20 }}>{message}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminSettings;