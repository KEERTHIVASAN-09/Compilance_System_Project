import { useState, useRef } from "react";

function Settings({ user, onSettingsUpdate }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const fileInputRef = useRef(null);

  // Profile edit state
  const [profileData, setProfileData] = useState({
    name: user.name
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Photo state
  const [photoPreview, setPhotoPreview] = useState(user.photo || null);

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 4000);
  };

  // Handle name update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      showMessage("Name cannot be empty", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/auth/update-profile/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileData.name })
      });

      const data = await response.json();

      if (response.ok) {
        // Update localStorage
        const updatedUser = { ...user, name: profileData.name };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        showMessage("Name updated successfully", "success");
        if (onSettingsUpdate) {
          onSettingsUpdate(updatedUser);
        }
      } else {
        showMessage(data.message || "Failed to update profile", "error");
      }
    } catch (error) {
      console.error(error);
      showMessage("Server error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showMessage("All password fields are required", "error");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage("New password and confirm password do not match", "error");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showMessage("New password must be at least 6 characters", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/auth/change-password/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData)
      });

      const data = await response.json();

      if (response.ok) {
        showMessage("Password changed successfully", "success");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        showMessage(data.message || "Failed to change password", "error");
      }
    } catch (error) {
      console.error(error);
      showMessage("Server error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Compress image before upload
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Resize to max 400x400
          const maxSize = 400;
          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with quality 0.7
          const compressedData = canvas.toDataURL("image/jpeg", 0.7);
          resolve(compressedData);
        };
        img.onerror = () => reject(new Error("Failed to load image"));
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
    });
  };

  // Handle photo selection
  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showMessage("File size must be less than 2MB", "error");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showMessage("Please select a valid image file", "error");
      return;
    }

    try {
      const compressedImage = await compressImage(file);
      setPhotoPreview(compressedImage);
      showMessage("Photo ready to upload", "success");
    } catch (error) {
      console.error(error);
      showMessage("Failed to process image", "error");
    }
  };

  // Handle photo upload
  const handlePhotoUpload = async () => {
    if (!photoPreview) {
      showMessage("Please select a photo first", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/auth/update-photo/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo: photoPreview })
      });

      const data = await response.json();

      if (response.ok) {
        // Update localStorage
        const updatedUser = { ...user, photo: photoPreview };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        showMessage("Photo updated successfully", "success");
        if (onSettingsUpdate) {
          onSettingsUpdate(updatedUser);
        }
      } else {
        showMessage(data.message || "Failed to update photo", "error");
      }
    } catch (error) {
      console.error(error);
      showMessage("Server error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-main">
      <h1>Settings</h1>
      <p>Manage your account settings and preferences</p>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      <div className="settings-container">
        {/* Tabs */}
        <div className="settings-tabs">
          <button
            className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button
            className={`tab-btn ${activeTab === "password" ? "active" : ""}`}
            onClick={() => setActiveTab("password")}
          >
            Password
          </button>
          <button
            className={`tab-btn ${activeTab === "photo" ? "active" : ""}`}
            onClick={() => setActiveTab("photo")}
          >
            Photo
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="settings-content">
            <div className="settings-card">
              <h2>Edit Profile</h2>
              <form onSubmit={handleProfileUpdate}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="input-disabled"
                  />
                  <small>Email cannot be changed</small>
                </div>

                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label>Role</label>
                  <input
                    type="text"
                    value={user.role}
                    disabled
                    className="input-disabled"
                  />
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Updating..." : "Update Profile"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <div className="settings-content">
            <div className="settings-card">
              <h2>Change Password</h2>
              <form onSubmit={handlePasswordChange}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                  />
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter new password (min. 6 characters)"
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                  />
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Updating..." : "Change Password"}
                </button>
              </form>

              <div className="password-tips">
                <h4>Password Tips:</h4>
                <ul>
                  <li>Use at least 6 characters</li>
                  <li>Mix uppercase and lowercase letters</li>
                  <li>Include numbers and special characters</li>
                  <li>Don't use common words or personal information</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Photo Tab */}
        {activeTab === "photo" && (
          <div className="settings-content">
            <div className="settings-card">
              <h2>Update Profile Photo</h2>

              <div className="photo-preview-container">
                <div className="photo-preview">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile preview" />
                  ) : (
                    <div className="photo-placeholder">📸</div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  className="photo-select-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  📁 Choose Photo
                </button>
              </div>

              {photoPreview && (
                <button
                  type="button"
                  className="submit-btn"
                  onClick={handlePhotoUpload}
                  disabled={loading}
                >
                  {loading ? "Uploading..." : "Upload Photo"}
                </button>
              )}

              <div className="photo-guidelines">
                <h4>Photo Guidelines:</h4>
                <ul>
                  <li>Supported formats: JPG, PNG, GIF</li>
                  <li>Maximum file size: 5MB</li>
                  <li>Recommended size: 400x400 pixels</li>
                  <li>Use a clear, well-lit photo</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
