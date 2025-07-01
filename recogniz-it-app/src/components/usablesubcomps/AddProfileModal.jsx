import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Code, Globe, Monitor } from 'lucide-react';
import './AddProfileModal.css';

const AddProfileModal = ({ isOpen, onClose, onAdd, editProfile = null }) => {
  const [profileName, setProfileName] = useState('');
  const [apps, setApps] = useState([]);
  const [profileColor, setProfileColor] = useState('#6a49ff'); // Default color

  // Convert backend app format to frontend format
  const convertBackendToFrontend = (backendApps) => {
    return backendApps.map(app => {
      if (app.open_command === 'browser') {
        // Handle both single URL (string) and multiple URLs (array)
        const urls = Array.isArray(app.path_or_url) ? app.path_or_url : [app.path_or_url];
        return {
          type: 'browser',
          urls: urls.filter(url => url && url.trim()) // Filter out empty URLs
        };
      } else if (app.open_command === 'code') {
        return {
          type: 'code',
          path: app.path_or_url
        };
      } else {
        return {
          type: 'app',
          command: app.open_command
        };
      }
    });
  };

  // Load edit data when modal opens or editProfile changes
  useEffect(() => {
    console.log('AddProfileModal useEffect - isOpen:', isOpen, 'editProfile:', editProfile);
    if (isOpen && editProfile) {
      console.log('Loading edit data for profile:', editProfile.name);
      setProfileName(editProfile.name);
      setApps(convertBackendToFrontend(editProfile.apps || []));
      setProfileColor(editProfile.color || '#6a49ff');
    } else if (isOpen && !editProfile) {
      console.log('Resetting form - no edit profile');
      resetForm();
    }
  }, [isOpen, editProfile]);

  const resetForm = () => {
    setProfileName('');
    setApps([]);
    setProfileColor('#6a49ff');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (profileName.trim() && apps.length > 0) {
      onAdd({
        name: profileName.trim(),
        apps: apps,
        color: profileColor,
        id: editProfile?.id // Pass the ID if editing
      });
      resetForm();
    }
  };

  const addApp = () => {
    setApps([...apps, { type: 'browser', urls: [''] }]);
  };

  const removeApp = (index) => {
    setApps(apps.filter((_, i) => i !== index));
  };

  const updateApp = (index, field, value) => {
    const updatedApps = [...apps];
    if (field === 'type') {
      // Reset app data when type changes
      if (value === 'browser') {
        updatedApps[index] = { type: value, urls: [''] };
      } else if (value === 'code') {
        updatedApps[index] = { type: value, path: '' };
      } else if (value === 'app') {
        updatedApps[index] = { type: value, command: '' };
      }
    } else if (field === 'urls') {
      updatedApps[index].urls = value;
    } else {
      updatedApps[index][field] = value;
    }
    setApps(updatedApps);
  };

  const updateUrl = (appIndex, urlIndex, value) => {
    const updatedApps = [...apps];
    updatedApps[appIndex].urls[urlIndex] = value;
    setApps(updatedApps);
  };

  const addUrl = (appIndex) => {
    const updatedApps = [...apps];
    updatedApps[appIndex].urls.push('');
    setApps(updatedApps);
  };

  const removeUrl = (appIndex, urlIndex) => {
    const updatedApps = [...apps];
    updatedApps[appIndex].urls = updatedApps[appIndex].urls.filter((_, i) => i !== urlIndex);
    setApps(updatedApps);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'browser': return <Globe size={16} />;
      case 'code': return <Code size={16} />;
      case 'app': return <Monitor size={16} />;
      default: return <Monitor size={16} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">
            {editProfile ? 'Edit Workspace' : 'Add New Workspace'}
          </h2>
          <button
            onClick={handleClose}
            className="close-button"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Workspace Name</label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="form-input"
              placeholder="Enter workspace name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Card Color</label>
            <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
              {['#6a49ff', '#22c55e', '#f59e42', '#ec4899', '#06b6d4'].map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setProfileColor(color)}
                  style={{
                    width: 28,
                    height: 28,
                    aspectRatio: '1/1', // Ensures perfect circle
                    borderRadius: '50%',
                    border: profileColor === color ? '2.5px solid #222' : '1.5px solid #e5e7eb',
                    background: color,
                    cursor: 'pointer',
                    outline: 'none',
                    boxShadow: profileColor === color ? '0 0 0 2px #6366f1' : '0 1px 2px rgba(0,0,0,0.07)',
                    transition: 'box-shadow 0.18s, border 0.18s',
                    position: 'relative',
                    padding: 0,
                  }}
                  aria-label={`Choose color ${color}`}
                  className="color-circle-btn"
                >
                  {/* No SVG or extra content, just a circle */}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <div className="form-header">
              <label className="form-label">Apps & Links</label>
              <button type="button" onClick={addApp} className="add-app-button">
                <Plus size={16} />
                Add App
              </button>
            </div>

            <div className="apps-list">
              {apps.map((app, appIndex) => (
                <div key={appIndex} className="app-item">
                  <div className="app-item-header">
                    <div className="app-type-selector">
                      {getTypeIcon(app.type)}
                      <select
                        value={app.type}
                        onChange={(e) => updateApp(appIndex, 'type', e.target.value)}
                        className="type-select"
                      >
                        <option value="browser">Browser</option>
                        <option value="code">Code Editor</option>
                        <option value="app">Application</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeApp(appIndex)}
                      className="remove-app-button"
                    >
                      <Trash2 size={16} className='trashsvg'/>
                    </button>
                  </div>

                  {app.type === 'browser' && (
                    <div className="app-content">
                      <label className="field-label">URLs</label>
                      {app.urls.map((url, urlIndex) => (
                        <div key={urlIndex} className="url-input-group">
                          <input
                            type="url"
                            value={url}
                            onChange={(e) => updateUrl(appIndex, urlIndex, e.target.value)}
                            className="url-input"
                            placeholder="https://example.com"
                          />
                          {app.urls.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeUrl(appIndex, urlIndex)}
                              className="remove-url-button"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addUrl(appIndex)}
                        className="add-url-button"
                      >
                        <Plus size={14} />
                        Add URL
                      </button>
                    </div>
                  )}

                  {app.type === 'code' && (
                    <div className="app-content">
                      <label className="field-label">Path</label>
                      <input
                        type="text"
                        value={app.path || ''}
                        onChange={(e) => updateApp(appIndex, 'path', e.target.value)}
                        className="path-input"
                        placeholder="C:/Users/username/projects/my-project"
                      />
                    </div>
                  )}

                  {app.type === 'app' && (
                    <div className="app-content">
                      <label className="field-label">Command</label>
                      <input
                        type="text"
                        value={app.command || ''}
                        onChange={(e) => updateApp(appIndex, 'command', e.target.value)}
                        className="command-input"
                        placeholder="notepad, figma, etc."
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={handleClose} className="cancel-button">
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={!profileName.trim() || apps.length === 0}
            >
              {editProfile ? 'Update Workspace' : 'Add Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProfileModal;
