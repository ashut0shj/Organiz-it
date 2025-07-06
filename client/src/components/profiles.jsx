import React, { useState, useEffect } from 'react';
import { Code, Globe, Monitor, Plus, MoreVertical, Edit, Trash2 } from 'lucide-react';
import AddProfileModal from './AddProfileModal';
import Navbar from './Navbar';
import LoginPopup from './LoginPopup';
import { useAuth } from '../contexts/AuthContext';
import '../stylesheets/profiles.css';

const ProfileLauncher = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingProfile, setEditingProfile] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/profiles`);
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

  const getAppTypeIcon = (appName) => {
    switch (appName) {
      case 'Browser':
        return <Globe size={14} />;
      case 'VS Code':
        return <Code size={14} />;
      case 'Notepad':
      case 'Spotify':
      case 'Anaconda':
      case 'WhatsApp':
        return <Monitor size={14} />;
      default:
        // For custom commands, still show Monitor icon
        return <Monitor size={14} />;
    }
  };

  const getAppCount = (apps) => {
    return apps ? apps.length : 0;
  };

  const handleProfileLaunch = async (profile) => {
    console.log('Launching profile:', profile.name);
    try {
      const response = await fetch(`${API_BASE}/launch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: profile.name }),
      });
      const data = await response.json();
      console.log(data);
      if (data.status === "success") {
        // Refresh profiles to update last_used timestamp
        fetchProfiles();
      }
    } catch (error) {
      console.error("Error launching profile:", error);
    }
  };

  const handleAddProfile = async (newProfile) => {
    try {
      const backendProfile = {
        name: newProfile.name,
        color: newProfile.color,
        emoji: newProfile.emoji,
        apps: newProfile.apps.map(app => {
          if (app.type === 'browser') {
            const filteredUrls = app.urls.filter(url => url.trim());
            return {
              app_name: 'Browser',
              url: filteredUrls.length === 1 ? filteredUrls[0] : filteredUrls
            };
          } else if (app.type === 'code') {
            return {
              app_name: 'VS Code',
              url: app.path
            };
          } else if (app.type === 'app') {
            return {
              app_name: app.command === 'Other' ? app.customCommand : app.command,
              url: ''
            };
          } else {
            return {
              app_name: app.command === 'Other' ? app.customCommand : app.command,
              url: ''
            };
          }
        })
      };
      let response;
      if (newProfile.id) {
        response = await fetch(`${API_BASE}/profiles/${newProfile.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(backendProfile),
        });
      } else {
        response = await fetch(`${API_BASE}/profiles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(backendProfile),
        });
      }
      const data = await response.json();
      if (data.status === "success") {
        fetchProfiles();
        setIsModalOpen(false);
        setEditingProfile(null);
      }
    } catch (error) {
      console.error(`Error ${newProfile.id ? 'updating' : 'creating'} profile:`, error);
    }
  };

  const handleDeleteProfile = async (profileId, profileName) => {
    setProfileToDelete({ id: profileId, name: profileName });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteProfile = async () => {
    if (!profileToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE}/profiles/${profileToDelete.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setProfiles(profiles.filter(profile => profile.id !== profileToDelete.id));
        setOpenMenuId(null);
      }
    } catch (error) {
      console.error("Error deleting profile:", error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setProfileToDelete(null);
    }
  };

  const handleEditProfile = (profile) => {
    setEditingProfile(profile);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProfile(null);
  };

  const handleAddNewWorkspace = () => {
    setEditingProfile(null);
    setIsModalOpen(true);
  };

  const toggleMenu = (profileId, event) => {
    event.stopPropagation();
    setOpenMenuId(openMenuId === profileId ? null : profileId);
  };

  const handleProfileClick = (profile, event) => {
    if (event.target.closest('.profile-menu')) {
      return;
    }
    handleProfileLaunch(profile);
  };

  const totalApps = profiles.reduce((total, profile) => total + getAppCount(profile.apps), 0);
  const totalItems = profiles.reduce((total, profile) => total + getAppCount(profile.apps), 0);

  if (!user) {
    return (
      <>
        <Navbar profiles={[]} />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '80vh' }}>
          <LoginPopup />
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar profiles={profiles} />
        <div className="workspacer-container">
          <div className="workspacer-content">
            <div className="profiles-grid">
              <div className="profiles-loading">Loading profiles...</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar profiles={profiles} />
        <div className="workspacer-container">
          <div className="workspacer-content">
            <div className="profiles-grid">
              <div className="profiles-error">Error loading profiles: {error}</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar profiles={profiles} />
      <div className="workspacer-container">
        <div className="workspacer-content">
          <div className="profiles-grid">
            {profiles.map((profile, index) => (
              <div
                key={profile.id}
                className="profile-card"
                onClick={(event) => handleProfileClick(profile, event)}
                style={{ background: profile.color || '#6a49ff' }}
              >
                {profile.emoji && profile.emoji.trim() ? (
                  <>
                    <div className="profile-card-title">{profile.name}</div>
                    <div className="profile-card-emoji"><span>{profile.emoji}</span></div>
                    <div className="profile-card-apps">
                      {(() => {
                        const shownTypes = new Set();
                        const uniqueApps = [];
                        if (profile.apps) {
                          for (let i = 0; i < profile.apps.length; i++) {
                            const app = profile.apps[i];
                            const type = app.app_name;
                            if (!shownTypes.has(type)) {
                              shownTypes.add(type);
                              uniqueApps.push(app);
                            }
                            if (uniqueApps.length === 6) break;
                          }
                        }
                        return uniqueApps.map((app, appIndex) => (
                          <div key={appIndex} className="profile-card-app">
                            {getAppTypeIcon(app.app_name)}
                          </div>
                        ));
                      })()}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="profile-card-title-noemoji">
                      <span>{profile.name}</span>
                    </div>
                    {profile.apps && profile.apps.length > 0 && (
                      <div className="profile-card-apps">
                        {(() => {
                          const shownTypes = new Set();
                          const uniqueApps = [];
                          for (let i = 0; i < profile.apps.length; i++) {
                            const app = profile.apps[i];
                            const type = app.app_name;
                            if (!shownTypes.has(type)) {
                              shownTypes.add(type);
                              uniqueApps.push(app);
                            }
                            if (uniqueApps.length === 6) break;
                          }
                          return uniqueApps.map((app, appIndex) => (
                            <div key={appIndex} className="profile-card-app">
                              {getAppTypeIcon(app.app_name)}
                            </div>
                          ));
                        })()}
                      </div>
                    )}
                  </>
                )}
                {/* Profile menu button (edit/delete) remains top right, absolute */}
                <div className="profile-menu" style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}>
                  <button 
                    className="menu-trigger"
                    onClick={(event) => toggleMenu(profile.id, event)}
                  >
                    <MoreVertical size={16} />
                  </button>
                  {openMenuId === profile.id && (
                    <div className="menu-dropdown">
                      <button 
                        className="menu-item"
                        onClick={() => handleEditProfile(profile)}
                      >
                        <Edit size={14} />
                        Edit Profile
                      </button>
                      <button 
                        className="menu-item delete"
                        onClick={() => handleDeleteProfile(profile.id, profile.name)}
                      >
                        <Trash2 size={14} />
                        Delete Profile
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div className="add-profile-card" onClick={handleAddNewWorkspace}>
              <div className="add-profile-content">
                <div className="add-profile-icon">
                  <Plus size={16} />
                </div>
                <span className="add-profile-text">Add Workspace</span>
              </div>
            </div>
          </div>
        </div>
        <AddProfileModal
          key={editingProfile ? `edit-${editingProfile.id}` : 'add-new'}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onAdd={handleAddProfile}
          editProfile={editingProfile}
        />
        {deleteDialogOpen && (
          <div className="delete-dialog-overlay">
            <div className="delete-dialog">
              <p>Are you sure you want to delete <b>{profileToDelete?.name}</b>?</p>
              <div className="delete-dialog-actions">
                <button onClick={confirmDeleteProfile} disabled={isDeleting} className="delete-dialog-confirm">{isDeleting ? 'Deleting...' : 'Delete'}</button>
                <button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting} className="delete-dialog-cancel">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileLauncher;