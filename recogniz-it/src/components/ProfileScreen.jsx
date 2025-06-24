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
          
          <div className="add-profile-card">
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
      </div>
    </div>
  );
};

export default ProfileScreen; 