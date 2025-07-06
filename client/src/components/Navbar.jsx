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
          <div className="navbar-profile-img-wrapper">
            <img
              src={user.picture}
              alt="Profile"
              className="navbar-profile-img"
              onClick={() => setShowDropdown(v => !v)}
              onError={e => {
                e.target.onerror = null;
                e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || user.email);
              }}
            />
            {showDropdown && (
              <div className="navbar-dropdown">
                <div className="navbar-dropdown-header">
                  <img
                    src={user.picture}
                    alt="Profile"
                    className="navbar-dropdown-img"
                    onError={e => {
                      e.target.onerror = null;
                      e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || user.email);
                    }}
                  />
                  <div>
                    <div className="navbar-dropdown-name">{user.name || user.given_name}</div>
                    <div className="navbar-dropdown-email">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => { setShowDropdown(false); logout(); }}
                  className="navbar-logout-btn"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button
              className="navbar-login-btn"
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