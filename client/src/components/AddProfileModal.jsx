import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Code, Globe, Monitor, Smile } from 'lucide-react';
import '../stylesheets/AddProfileModal.css';

const AddProfileModal = ({ isOpen, onClose, onAdd, editProfile = null }) => {
  const [profileName, setProfileName] = useState('');
  const [apps, setApps] = useState([]);
  const [profileColor, setProfileColor] = useState('#6a49ff');
  const [profileEmoji, setProfileEmoji] = useState('');
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const emojiList = [
    '😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎',
    '😍','😘','🥰','😗','😙','😚','🙂','🤗','🤩','🤔','🤨','😐',
    '😑','😶','🙄','😏','😣','😥','😮','🤐','😯','😪','😫','🥱',
    '😴','😌','😛','😜','😝','🤤','😒','😓','😔','��','🙃','🤑'
  ];

  const emojiPickerRef = useRef(null);

  useEffect(() => {
    if (!emojiPickerOpen) return;
    function handleClick(e) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setEmojiPickerOpen(false);
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setEmojiPickerOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [emojiPickerOpen]);

  const convertBackendToFrontend = (backendApps) => {
    return backendApps.map(app => {
      if (app.app_name === 'Browser') {
        const urls = Array.isArray(app.url) ? app.url : [app.url];
        return {
          type: 'browser',
          urls: urls.filter(url => url && url.trim())
        };
      } else if (app.app_name === 'VS Code') {
        return {
          type: 'code',
          path: app.url
        };
      } else if (['Notepad', 'Spotify', 'Anaconda', 'WhatsApp'].includes(app.app_name)) {
        return {
          type: 'app',
          command: app.app_name
        };
      } else {
        return {
          type: 'app',
          command: 'Other',
          customCommand: app.app_name
        };
      }
    });
  };

  useEffect(() => {
    console.log('AddProfileModal useEffect - isOpen:', isOpen, 'editProfile:', editProfile);
    if (isOpen && editProfile) {
      console.log('Loading edit data for profile:', editProfile.name);
      setProfileName(editProfile.name);
      setApps(convertBackendToFrontend(editProfile.apps || []));
      setProfileColor(editProfile.color || '#6a49ff');
      setProfileEmoji(editProfile.emoji || '');
    } else if (isOpen && !editProfile) {
      console.log('Resetting form - no edit profile');
      resetForm();
    }
  }, [isOpen, editProfile]);

  const resetForm = () => {
    setProfileName('');
    setApps([]);
    setProfileColor('#6a49ff');
    setProfileEmoji('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (profileName.trim() || profileEmoji.trim()) {
      onAdd({
        name: profileName.trim() || '',
        apps: apps,
        color: profileColor,
        emoji: profileEmoji,
        id: editProfile?.id
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
      if (value === 'browser') {
        updatedApps[index] = { type: value, urls: [''] };
      } else if (value === 'code') {
        updatedApps[index] = { type: value, path: '' };
      } else if (value === 'app') {
        updatedApps[index] = { type: value, command: '' };
      }
    } else if (field === 'urls') {
      updatedApps[index].urls = value;
    } else if (field === 'command' && value === 'Other') {
      updatedApps[index][field] = value;
      updatedApps[index].customCommand = '';
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
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label className="form-label" style={{ flexShrink: 0 }}>Workspace Name</label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="form-input"
              placeholder="Enter workspace name (optional)"
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={() => setEmojiPickerOpen(v => !v)}
              className={`emoji-button ${profileEmoji ? 'has-emoji' : ''}`}
              aria-label={profileEmoji ? `Selected emoji: ${profileEmoji}` : "Pick emoji"}
              style={{ color: profileEmoji ? undefined : '#9ca3af' }}
            >
              {profileEmoji ? profileEmoji : <Smile size={22} color="inherit" />}
            </button>
            {emojiPickerOpen && (
              <div
                ref={emojiPickerRef}
                className="emoji-picker-menu"
              >
                {emojiList.map((emoji, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setProfileEmoji(emoji); setEmojiPickerOpen(false); }}
                    className="emoji-btn"
                    aria-label={`Select emoji ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            {profileEmoji && (
              <button
                type="button"
                onClick={() => setProfileEmoji('')}
                className="emoji-clear-button"
                aria-label="Clear emoji"
              >
                ×
              </button>
            )}
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
                    aspectRatio: '1/1',
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
                      <label className="field-label">Application</label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                        <select
                          value={app.command || ''}
                          onChange={(e) => updateApp(appIndex, 'command', e.target.value)}
                          className="command-input"
                          style={{ flex: 1 }}
                        >
                          <option value="">Select an application</option>
                          <option value="Notepad">Notepad</option>
                          <option value="Spotify">Spotify</option>
                          <option value="Anaconda">Anaconda</option>
                          <option value="WhatsApp">WhatsApp</option>
                          <option value="Other">Other</option>
                        </select>
                        {app.command === 'Other' && (
                          <input
                            type="text"
                            value={app.customCommand || ''}
                            onChange={(e) => updateApp(appIndex, 'customCommand', e.target.value)}
                            className="command-input"
                            placeholder="Command (e.g., firefox)"
                            style={{ flex: 1 }}
                          />
                        )}
                      </div>
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
              disabled={!profileName.trim() && !profileEmoji.trim()}
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
