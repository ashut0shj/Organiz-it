import React, { useState, useEffect } from 'react';
import { Code, Globe, Monitor, Plus, MoreVertical, Edit, Trash2 } from 'lucide-react';
import AddProfileModal from '../usablesubcomps/AddProfileModal';
import Navbar from '../usablesubcomps/Navbar';
import { useNotifications } from '@/hooks/use-notifications';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import '../stylesheets/profiles.css';

const ProfileLauncher = () => {
  const [profiles, setProfiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingProfile, setEditingProfile] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const notifications = useNotifications();

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
        notifications.showSuccess("Profile Launched", `Profile "${profile.name}" launched successfully!`);
        // Refresh profiles to update last_used timestamp
        fetchProfiles();
      } else {
        notifications.showError("Launch Failed", data.message);
      }
    } catch (error) {
      console.error("Error launching profile:", error);
      notifications.showError("Launch Failed", "Failed to launch profile.");
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
              path_or_url: app.urls.filter(url => url.trim()) // Send all non-empty URLs
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
        // Update existing profile
        response = await fetch(`http://localhost:8000/profiles/${newProfile.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(backendProfile),
        });
      } else {
        // Create new profile
        response = await fetch("http://localhost:8000/profiles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(backendProfile),
        });
      }

      const data = await response.json();
      
      if (data.status === "success") {
        notifications.showSuccess(
          newProfile.id ? "Profile Updated" : "Profile Created", 
          newProfile.id ? "Profile updated successfully!" : "Profile created successfully!"
        );
        // Refresh profiles list
        fetchProfiles();
        setIsModalOpen(false);
        setEditingProfile(null);
      } else {
        notifications.showError(
          "Operation Failed", 
          `Error ${newProfile.id ? 'updating' : 'creating'} profile: ${data.message}`
        );
      }
    } catch (error) {
      console.error(`Error ${newProfile.id ? 'updating' : 'creating'} profile:`, error);
      notifications.showError(
        "Operation Failed", 
        `Failed to ${newProfile.id ? 'update' : 'create'} profile.`
      );
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
      const response = await fetch(`http://localhost:8000/profiles/${profileToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove profile from local state
        setProfiles(profiles.filter(profile => profile.id !== profileToDelete.id));
        setOpenMenuId(null);
        notifications.showSuccess("Profile Deleted", `Profile "${profileToDelete.name}" deleted successfully!`);
      } else {
        notifications.showError("Delete Failed", "Failed to delete profile.");
      }
    } catch (error) {
      console.error("Error deleting profile:", error);
      notifications.showError("Delete Failed", "Failed to delete profile.");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setProfileToDelete(null);
    }
  };

  const handleEditProfile = (profile) => {
    console.log('handleEditProfile called with profile:', profile);
    setEditingProfile(profile);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleCloseModal = () => {
    console.log('handleCloseModal called');
    setIsModalOpen(false);
    setEditingProfile(null);
  };

  const handleAddNewWorkspace = () => {
    console.log('handleAddNewWorkspace called');
    setEditingProfile(null); // Clear any editing state
    setIsModalOpen(true);
  };

  const toggleMenu = (profileId, event) => {
    event.stopPropagation(); // Prevent profile launch
    setOpenMenuId(openMenuId === profileId ? null : profileId);
  };

  const handleProfileClick = (profile, event) => {
    // Don't launch if clicking on menu
    if (event.target.closest('.profile-menu')) {
      return;
    }
    handleProfileLaunch(profile);
  };

  const totalApps = profiles.reduce((total, profile) => total + getAppCount(profile.apps), 0);
  const totalItems = profiles.reduce((total, profile) => total + getAppCount(profile.apps), 0);

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
              <div key={profile.id} className="profile-card" onClick={(event) => handleProfileClick(profile, event)}>
                <div className="profile-header">
                  <h3 className="profile-name">{profile.name}</h3>
                  <div className="profile-menu">
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

        <ConfirmationDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={confirmDeleteProfile}
          title="Delete Workspace"
          message={`Are you sure you want to delete "${profileToDelete?.name}"?   This action cannot be undone.`}
          confirmText="Delete Workspace"
          cancelText="Keep Workspace"
          type="danger"
          isLoading={isDeleting}
        />
      </div>
    </>
  );
};

export default ProfileLauncher;