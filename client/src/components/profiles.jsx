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
            return {
              app_name: 'Browser',
              open_command: 'browser',
              path_or_url: app.urls.filter(url => url.trim())
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
                style={{
                  background: profile.color || '#6a49ff',
                  position: 'relative',
                  width: 160,
                  height: 160,
                  borderRadius: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 12px rgba(106,73,255,0.08)',
                  cursor: 'pointer',
                  padding: 0,
                  margin: 0,
                  overflow: 'hidden',
                  transition: 'box-shadow 0.18s',
                }}
              >
                {profile.emoji ? (
                  <>
                    <div style={{
                      width: '100%',
                      textAlign: 'center',
                      fontWeight: 600,
                      fontSize: 16,
                      color: '#fff',
                      padding: '14px 0 0 0',
                      letterSpacing: 0.2,
                      textShadow: '0 1px 4px rgba(0,0,0,0.10)'
                    }}>{profile.name}</div>
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                    }}>
                      <span style={{
                        fontSize: '3.2rem',
                        lineHeight: 1,
                        userSelect: 'none',
                        filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.10))',
                      }}>{profile.emoji}</span>
                    </div>
                    <div style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '0 0 12px 0',
                    }}>
                      {(() => {
                        const shownTypes = new Set();
                        const uniqueApps = [];
                        if (profile.apps) {
                          for (let i = 0; i < profile.apps.length; i++) {
                            const app = profile.apps[i];
                            const type = app.open_command;
                            if (!shownTypes.has(type)) {
                              shownTypes.add(type);
                              uniqueApps.push(app);
                            }
                            if (uniqueApps.length === 6) break;
                          }
                        }
                        return uniqueApps.map((app, appIndex) => (
                          <div key={appIndex} style={{
                            width: 22,
                            height: 22,
                            background: 'rgba(255,255,255,0.13)',
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1.5px solid rgba(255,255,255,0.18)',
                            margin: 0,
                            padding: 0,
                          }}>
                            {getAppTypeIcon(app.open_command)}
                          </div>
                        ));
                      })()}
                    </div>
                  </>
                ) : (
                  <div style={{
                    flex: 1,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <span style={{
                      fontWeight: 800,
                      fontSize: 26,
                      color: '#fff',
                      textAlign: 'center',
                      letterSpacing: 0.3,
                      textShadow: '0 2px 8px rgba(0,0,0,0.13)'
                    }}>{profile.name}</span>
                  </div>
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
      </div>
    </>
  );
};

export default ProfileLauncher;