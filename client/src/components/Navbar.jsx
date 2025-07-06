import React, { useState } from 'react';
import '../stylesheets/navbar.css';
import { useAuth } from '../contexts/AuthContext';
import LoginPopup from './LoginPopup';
import { RefreshCw } from 'lucide-react';

const Navbar = ({ profiles }) => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Calculate total workspaces and total apps
  const totalWorkspaces = profiles.length;
  const totalApps = profiles.reduce((total, profile) => total + (profile.apps ? profile.apps.length : 0), 0);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo">
          <img src="/vite.svg" alt="Organiz-it Logo" className="logo-image" />
        </div>
        <span className="navbar-title">workspacer</span>
      </div>
      <div className="navbar-right">
        <span className="navbar-count">Workspaces: <b>{totalWorkspaces}</b></span>
        <span className="navbar-count">Apps: <b>{totalApps}</b></span>
        <button
          className="navbar-sync-btn"
          title="Sync"
        >
          <RefreshCw size={20} color="#6a49ff" />
        </button>
        {user && user.picture ? (
          <div style={{ position: 'relative', marginLeft: 16 }}>
            <img
              src={user.picture}
              alt="Profile"
              style={{ width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', border: '2px solid #8b5cf6', objectFit: 'cover' }}
              onClick={() => setShowDropdown(v => !v)}
              onError={e => {
                e.target.onerror = null;
                e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || user.email);
              }}
            />
            {showDropdown && (
              <div style={{
                position: 'absolute', right: 0, top: 44, background: 'white', borderRadius: 12, boxShadow: '0 4px 24px rgba(106,73,255,0.10)', minWidth: 220, zIndex: 100,
                padding: 18, textAlign: 'left', color: '#222', fontSize: 15
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <img
                    src={user.picture}
                    alt="Profile"
                    style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                    onError={e => {
                      e.target.onerror = null;
                      e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || user.email);
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}>{user.name || user.given_name}</div>
                    <div style={{ fontSize: 13, color: '#888' }}>{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => { setShowDropdown(false); logout(); }}
                  style={{ width: '100%', background: '#f87171', color: 'white', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginTop: 8 }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button
              style={{ marginLeft: 16, background: '#6a49ff', color: 'white', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
              onClick={() => setShowLogin(true)}
            >
              Login
            </button>
            {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 