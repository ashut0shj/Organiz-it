import React, { useState, useEffect } from 'react';
import { Code, Globe, Monitor, Plus } from 'lucide-react';
import AddProfileModal from '../usablesubcomps/AddProfileModal';
import '../stylesheets/profiles.css';

const ProfileLauncher = () => {
  const [profiles, setProfiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch profiles from backend
  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/profiles");
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
        return <Globe size={14} />;
      case 'code':
        return <Code size={14} />;
      default:
        return <Monitor size={14} />;
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

  const handleAddProfile = async (newProfile) => {
    try {
      // Convert frontend format to backend format
      const backendProfile = {
        name: newProfile.name,
        apps: newProfile.apps.map(app => {
          if (app.type === 'browser') {
            return {
              app_name: 'Browser',
              open_command: 'browser',
              path_or_url: app.urls[0] // Take first URL for now
            };
          } else if (app.type === 'code') {
            return {
              app_name: 'VS Code',
              open_command: 'code',
              path_or_url: app.path
            };
          } else {
            return {
              app_name: app.command,
              open_command: app.command,
              path_or_url: ''
            };
          }
        })
      };

      const response = await fetch("http://localhost:8000/profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(backendProfile),
      });

      const data = await response.json();
      
      if (data.status === "success") {
        // Refresh profiles list
        fetchProfiles();
        setIsModalOpen(false);
      } else {
        alert(`Error creating profile: ${data.message}`);
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      alert("Failed to create profile.");
    }
  };

  const totalApps = profiles.reduce((total, profile) => total + getAppCount(profile.apps), 0);
  const totalItems = profiles.reduce((total, profile) => total + getAppCount(profile.apps), 0);

  if (loading) {
    return (
      <div className="workspacer-container">
        <div className="workspacer-content">
          <div className="profiles-grid">
            <div style={{ 
              gridColumn: '1 / -1', 
              textAlign: 'center', 
              color: '#94a3b8', 
              fontSize: '18px',
              padding: '40px' 
            }}>
              Loading profiles...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="workspacer-container">
        <div className="workspacer-content">
          <div className="profiles-grid">
            <div style={{ 
              gridColumn: '1 / -1', 
              textAlign: 'center', 
              color: '#f87171', 
              fontSize: '18px',
              padding: '40px' 
            }}>
              Error loading profiles: {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="workspacer-container">
      <div className="workspacer-content">
        <div className="profiles-grid">
          {profiles.map((profile, index) => (
            <div key={profile.id} className="profile-card" onClick={() => handleProfileLaunch(profile)}>
              <h3 className="profile-name">{profile.name}</h3>
              
              <div className="app-badges">
                {profile.apps && profile.apps.slice(0, 8).map((app, appIndex) => (
                  <div key={appIndex} className="app-badge">
                    {getAppTypeIcon(app.open_command)}
                  </div>
                ))}
                {profile.apps && profile.apps.length > 8 && (
                  <div className="app-badge" style={{ 
                    background: 'rgba(139, 92, 246, 0.3)',
                    borderColor: 'rgba(139, 92, 246, 0.5)',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#ddd6fe'
                  }}>
                    +{profile.apps.length - 8}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          <div className="add-profile-card" onClick={() => setIsModalOpen(true)}>
            <div className="add-profile-content">
              <div className="add-profile-icon">
                <Plus size={16} />
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

      <AddProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddProfile}
      />
    </div>
  );
};

export default ProfileLauncher;