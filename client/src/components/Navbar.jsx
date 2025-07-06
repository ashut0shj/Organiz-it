import React from 'react';
import '../stylesheets/navbar.css';

const Navbar = ({ profiles }) => {
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
      </div>
    </nav>
  );
};

export default Navbar; 