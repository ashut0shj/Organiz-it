import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Code, Globe, Monitor, Plus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import './ProfileScreen.css';

const ProfileScreen = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [apps, setApps] = useState([]);
  const [appName, setAppName] = useState("");
  const [appType, setAppType] = useState("browser");
  const [appPathOrUrl, setAppPathOrUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If not authenticated, show login page
  if (!user || !token) {
    return <div>Please log in to view profiles.</div>;
  }

  useEffect(() => {
    fetchProfiles();
  }, [token]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/profiles", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch profiles');
      }
      const data = await response.json();
      setProfiles(data.profiles || []);
    } catch (err) {
      console.error("Error fetching profiles:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAppTypeIcon = (openCommand) => {
    switch (openCommand) {
      case 'browser':
        return <Globe size={16} />;
      case 'code':
        return <Code size={16} />;
      default:
        return <Monitor size={16} />;
    }
  };

  const getAppCount = (apps) => {
    return apps ? apps.length : 0;
  };

  const handleProfileLaunch = async (profile) => {
    console.log('Launching profile:', profile.name);

    try {
      const response = await fetch("http://localhost:8000/launch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: profile.name }),
      });

      const data = await response.json();
      console.log(data);

      if (data.status === "success") {
        alert(`Profile "${profile.name}" launched successfully!`);
        // Refresh profiles to update last_used timestamp
        fetchProfiles();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error launching profile:", error);
      alert("Failed to launch profile.");
    }
  };

  const handleAddApp = () => {
    setApps([...apps, {
      app_name: appName,
      open_command: appType,
      path_or_url: appPathOrUrl
    }]);
    setAppName("");
    setAppType("browser");
    setAppPathOrUrl("");
  };

  const handleRemoveApp = (index) => {
    setApps(apps.filter((_, i) => i !== index));
  };

  const handleAddProfile = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newProfile = {
        name: newProfileName,
        apps
      };
      const response = await fetch("http://localhost:8000/profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newProfile),
      });
      const data = await response.json();
      if (data.status === "success") {
        setShowModal(false);
        setNewProfileName("");
        setApps([]);
        fetchProfiles();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert("Failed to add profile.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalApps = profiles.reduce((total, profile) => total + getAppCount(profile.apps), 0);
  const totalItems = profiles.reduce((total, profile) => total + getAppCount(profile.apps), 0);

  if (loading) {
    return (
      <div className="workspacer-container">
        <div className="workspacer-content">
          <div className="workspacer-header">
            <div className="logo-container">
              <div className="logo-icon">
                <Monitor />
              </div>
              <h1 className="app-title">workspacer</h1>
            </div>
            <p className="app-subtitle">Loading profiles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="workspacer-container">
        <div className="workspacer-content">
          <div className="workspacer-header">
            <div className="logo-container">
              <div className="logo-icon">
                <Monitor />
              </div>
              <h1 className="app-title">workspacer</h1>
            </div>
            <p className="app-subtitle">Error loading profiles: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="workspacer-container">
      <div className="background-decoration">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>

      <div className="workspacer-content">
        {/* Navigation Header */}
        <div className="profile-navigation">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="back-button"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
        </div>

        <div className="workspacer-header">
          <div className="logo-container">
            <div className="logo-icon">
              <Monitor />
            </div>
            <h1 className="app-title">workspacer</h1>
          </div>
          <p className="app-subtitle">Organize your workspace, simplify your workflow</p>
        </div>

        <div className="profiles-grid">
          {profiles.map((profile, index) => (
            <div key={profile.id} className={`profile-card gradient-${(index % 6) + 1}`} onClick={() => handleProfileLaunch(profile)}>
              <div className="profile-card-header">
                <h3 className="profile-name">{profile.name}</h3>
                <div className="play-button">
                  <Play size={16} />
                </div>
              </div>
              
              <div className="profile-info">
                <span className="item-count">{getAppCount(profile.apps)} items</span>
                {profile.last_used && (
                  <span className="last-used">Last used: {new Date(profile.last_used).toLocaleDateString()}</span>
                )}
              </div>
              
              <div className="app-badges">
                {profile.apps && profile.apps.slice(0, 3).map((app, appIndex) => (
                  <span key={appIndex} className="app-badge">
                    {getAppTypeIcon(app.open_command)}
                    <span className="app-type">{app.app_name}</span>
                  </span>
                ))}
                {profile.apps && profile.apps.length > 3 && (
                  <span className="more-count">+{profile.apps.length - 3}</span>
                )}
              </div>
            </div>
          ))}
          
          <div className="add-profile-card" onClick={() => setShowModal(true)}>
            <div className="add-profile-content">
              <div className="add-profile-icon">
                <Plus size={24} />
              </div>
              <span className="add-profile-text">Add Workspace</span>
            </div>
          </div>
        </div>

        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">{profiles.length}</div>
            <div className="stat-label">Workspaces</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{totalApps}</div>
            <div className="stat-label">Apps</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{totalItems}</div>
            <div className="stat-label">Items</div>
          </div>
        </div>

        {/* Modal for adding profile with multiple apps */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="close-modal" onClick={() => setShowModal(false)} aria-label="Close">&times;</button>
              <h2>Add New Workspace</h2>
              <form onSubmit={handleAddProfile}>
                <label>
                  Workspace Name:
                  <input type="text" value={newProfileName} onChange={e => setNewProfileName(e.target.value)} required />
                </label>
                <h3>Add Apps</h3>
                <div>
                  <label>
                    App Name:
                    <input type="text" value={appName} onChange={e => setAppName(e.target.value)} required />
                  </label>
                  <label>
                    App Type:
                    <select value={appType} onChange={e => setAppType(e.target.value)}>
                      <option value="browser">Browser</option>
                      <option value="code">VS Code</option>
                      <option value="custom">Custom</option>
                    </select>
                  </label>
                  <label>
                    Path or URL:
                    <input type="text" value={appPathOrUrl} onChange={e => setAppPathOrUrl(e.target.value)} required />
                  </label>
                  <button type="button" onClick={handleAddApp}>Add App</button>
                </div>
                <ul>
                  {apps.map((app, idx) => (
                    <li key={idx}>
                      {app.app_name} ({app.open_command}): {app.path_or_url}
                      <button type="button" onClick={() => handleRemoveApp(idx)}>Remove</button>
                    </li>
                  ))}
                </ul>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</button>
                  <button type="submit" disabled={submitting || apps.length === 0}>{submitting ? "Adding..." : "Add Workspace"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileScreen; 