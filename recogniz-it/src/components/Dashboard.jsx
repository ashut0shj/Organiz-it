import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Monitor, User, LogOut, Settings, BarChart3 } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">
              <Monitor />
            </div>
            <h1 className="app-title">workspacer</h1>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item active">
            <BarChart3 size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/profiles" className="nav-item">
            <Monitor size={20} />
            <span>Profiles</span>
          </Link>
          <Link to="/settings" className="nav-item">
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            {user.picture && (
              <img src={user.picture} alt={user.name} className="user-avatar" />
            )}
            <div className="user-details">
              <h4>{user.name}</h4>
              <p>{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-button">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h2>Welcome back, {user.name}!</h2>
          <p>Here's an overview of your workspace</p>
        </div>

        <div className="dashboard-content">
          {/* Quick Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <Monitor size={24} />
              </div>
              <div className="stat-content">
                <h3>Active Profiles</h3>
                <p className="stat-number">3</p>
                <p className="stat-description">Ready to launch</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <BarChart3 size={24} />
              </div>
              <div className="stat-content">
                <h3>Total Apps</h3>
                <p className="stat-number">12</p>
                <p className="stat-description">Across all profiles</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <User size={24} />
              </div>
              <div className="stat-content">
                <h3>Last Used</h3>
                <p className="stat-number">2h ago</p>
                <p className="stat-description">Frontend Dev</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="actions-grid">
              <Link to="/profiles" className="action-card">
                <Monitor size={32} />
                <h4>Manage Profiles</h4>
                <p>View and launch your workspaces</p>
              </Link>
              
              <div className="action-card">
                <Settings size={32} />
                <h4>Settings</h4>
                <p>Configure your preferences</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="recent-activity">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">
                  <Monitor size={16} />
                </div>
                <div className="activity-content">
                  <p>Launched <strong>Frontend Dev</strong> profile</p>
                  <span className="activity-time">2 hours ago</span>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon">
                  <Monitor size={16} />
                </div>
                <div className="activity-content">
                  <p>Launched <strong>Study</strong> profile</p>
                  <span className="activity-time">1 day ago</span>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon">
                  <User size={16} />
                </div>
                <div className="activity-content">
                  <p>Logged in successfully</p>
                  <span className="activity-time">2 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 