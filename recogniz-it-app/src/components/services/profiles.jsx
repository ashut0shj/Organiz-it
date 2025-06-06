import React, { useState } from 'react';
import { Play, Code, Globe, Monitor, Plus } from 'lucide-react';
import AddProfileModal from '../usablesubcomps/AddProfileModal';
import initialProfilesData from '../data/profiles.json';
import '../stylesheets/profiles.css';

const ProfileLauncher = () => {
  const [profiles, setProfiles] = useState(initialProfilesData);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getAppTypeIcon = (type) => {
    switch (type) {
      case 'browser':
        return <Globe size={16} />;
      case 'code':
        return <Code size={16} />;
      case 'app':
        return <Monitor size={16} />;
      default:
        return <Monitor size={16} />;
    }
  };

  const getAppCount = (apps) => {
    let count = 0;
    apps.forEach(app => {
      if (app.type === 'browser' && app.urls) {
        count += app.urls.length;
      } else {
        count += 1;
      }
    });
    return count;
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
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error launching profile:", error);
      alert("Failed to launch profile.");
    }
  };

  const handleAddProfile = (newProfile) => {
    const profileWithId = {
      ...newProfile,
      id: `profile_${Date.now()}` // Generate unique ID
    };
    setProfiles([...profiles, profileWithId]);
    setIsModalOpen(false);
  };

  const totalApps = profiles.reduce((total, profile) => total + profile.apps.length, 0);
  const totalItems = profiles.reduce((total, profile) => total + getAppCount(profile.apps), 0);

  return (
    <div className="workspacer-container">
      <div className="background-decoration">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>

      <div className="workspacer-content">
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
              </div>
              
              <div className="app-badges">
                {profile.apps.slice(0, 3).map((app, appIndex) => (
                  <span key={appIndex} className="app-badge">
                    {getAppTypeIcon(app.type)}
                    <span className="app-type">{app.type}</span>
                  </span>
                ))}
                {profile.apps.length > 3 && (
                  <span className="more-count">+{profile.apps.length - 3}</span>
                )}
              </div>
            </div>
          ))}
          
          <div className="add-profile-card" onClick={() => setIsModalOpen(true)}>
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

      <AddProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddProfile}
      />
    </div>
  );
};

export default ProfileLauncher;