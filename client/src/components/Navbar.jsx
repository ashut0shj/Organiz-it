import React, { useState, useEffect } from 'react';
import '../stylesheets/navbar.css';
import { useAuth } from '../contexts/AuthContext';
import { RefreshCw, LogIn } from 'lucide-react'; // Added LogIn for the button
import { useNavigate } from 'react-router-dom';

const Navbar = ({ profiles }) => {
  // Destructure the new loginWithCode function from our updated AuthContext
  const { user, logout, loginWithCode } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // This new useEffect hook listens for the auth code from the Electron main process
  useEffect(() => {
    const removeListener = window.electronAPI.onGoogleOAuthCode((code) => {
      console.log('Received auth code in React:', code);
      // When the code is received, call the login function in our context
      loginWithCode(code);
    });

    // Cleanup the listener when the component is no longer on screen
    return () => {
      removeListener();
    };
  }, [loginWithCode]);


  // Calculate total workspaces and total apps
  const totalWorkspaces = profiles.length;
  const totalApps = profiles.reduce((total, profile) => total + (profile.apps ? profile.apps.length : 0), 0);

  const handleSync = async () => {
    if (!user || !user.email) {
      console.error("No user email available for sync");
      return;
    }
    
    setIsSyncing(true);
    try {
      const response = await fetch(`${API_BASE}/api/sync-profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: user.email,
          profiles: profiles
        }),
      });
      
      const data = await response.json();
      if (data.status === "success") {
        console.log("Profiles synced successfully");
      } else {
        console.error("Sync failed:", data.error);
      }
    } catch (error) {
      console.error("Error syncing profiles:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // This function is called when the new login button is clicked
  const handleLogin = () => {
    // This tells the main process to open the Google login window
    window.electronAPI.startGoogleLogin();
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo">
          {/* Use a relative path for the logo to work in production */}
          <img src="./vite.svg" alt="Organiz-it Logo" className="logo-image" />
        </div>
        <span className="navbar-title">workspacer</span>
      </div>
      <div className="navbar-right">
        <span className="navbar-count">Workspaces: <b>{totalWorkspaces}</b></span>
        <span className="navbar-count">Apps: <b>{totalApps}</b></span>
        <button
          className="navbar-sync-btn"
          title="Sync"
          onClick={handleSync}
          disabled={isSyncing}
        >
          <RefreshCw size={20} color="#6a49ff" className={isSyncing ? "spinning" : ""} />
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
          // --- THIS IS THE REPLACEMENT FOR THE GOOGLE LOGIN COMPONENT ---
          <button onClick={handleLogin} className="navbar-login-btn">
            <LogIn size={18} style={{ marginRight: '8px' }}/>
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
