import { useEffect, useState } from "react";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch("https://student-management-system-self-five.vercel.app/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail);
        return;
      }

      setProfile(data);
      setUsername(data.username);
      setEmail(data.email);

    } catch (error) {
      console.error(error);
      alert("Backend server is not running");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch("https://student-management-system-self-five.vercel.app/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: username,
          email: email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail);
        return;
      }

      alert("Profile updated successfully!");

      setProfile(data);
      setEditing(false);

    } catch (error) {
      console.error(error);
      alert("Backend server is not running");
    }
  };

  if (loading) {
    return <h2>Loading profile...</h2>;
  }

  if (!profile) {
    return <h2>Profile not available</h2>;
  }

  return (
    <div className="profile-page">

      <div className="profile-content">

        <div className="profile-header">
          <h1>My Profile</h1>
          <p>View and manage your personal information.</p>
        </div>

        <div className="profile-card">

          <div className="profile-avatar">
            {profile.username.charAt(0).toUpperCase()}
          </div>

          <div className="profile-info">

            <div className="profile-field">
              <span>Full Name</span>

              {editing ? (
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              ) : (
                <p>{profile.username}</p>
              )}
            </div>

            <div className="profile-field">
              <span>User ID</span>
              <p>{profile.id}</p>
            </div>

            <div className="profile-field">
              <span>Email</span>

              {editing ? (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              ) : (
                <p>{profile.email}</p>
              )}
            </div>

            <div className="profile-field">
              <span>Role</span>
              <p>{profile.role}</p>
            </div>

          </div>

          {editing ? (
            <div>
              <button
                className="edit-profile-btn"
                onClick={handleUpdate}
              >
                Save Changes
              </button>

              <button
                className="edit-profile-btn"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="edit-profile-btn"
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </button>
          )}

        </div>
      </div>
    </div>
  );
}

export default Profile;