import React from 'react';
import { Play, Code, Globe, Monitor, Plus } from 'lucide-react';
import profilesData from './profiles.json';
import './styles.css';

const Profile_screen = () => {
  const getAppTypeIcon = (type) => {
    switch (type) {
      case 'browser':
        return <Globe size={14} />;
      case 'code':
        return <Code size={14} />;
      case 'app':
        return <Monitor size={14} />;
      default:
        return <Monitor size={14} />;
    }
  };

  const getAppCount = (apps) => {
    let count = 0;
    apps.forEach(app => {
      if (app.type === 'browser' && app.urls) {
        count += app.urls.length;
      } else {
        count += 1;
      }
    });
    return count;
  };

  const handleProfileLaunch = (profile) => {
    console.log('Launching profile:', profile.name);
    // for launching stuff , we'll do it later
  };

  const getGradientClass = (index) => {
    return `profile-card-gradient-${(index % 6) + 1}`;
  };

  return (
    <>
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" 
        rel="stylesheet"
      />
      
      <div className="container-fluid p-4 bg-white profile-launcher">
        {/* Widget Header */}
        <div className="mb-4">
          <h1 className="h4 fw-bold text-dark mb-1">Profile Launcher</h1>
          <p className="text-muted small mb-0">Quick launch your work environments</p>
        </div>

        {/* Profile Cards Grid */}
        <div className="row g-3 mb-4">
          {profilesData.map((profile, index) => (
            <div key={profile.id} className="col-6 col-md-4 col-lg-3">
              <div 
                className={`card h-100 text-white shadow-sm profile-card ${getGradientClass(index)}`}
                onClick={() => handleProfileLaunch(profile)}
              >
                <div className="card-body p-3">
                  {/* Card Header */}
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="card-title fw-bold mb-0 text-truncate flex-grow-1">
                      {profile.name}
                    </h6>
                    <div className="btn btn-sm rounded-circle p-1 ms-2 flex-shrink-0 play-button">
                      <Play size={12} />
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="mb-2">
                    <small className="opacity-75">
                      {getAppCount(profile.apps)} items
                    </small>
                  </div>
                  
                  {/* App Badges */}
                  <div className="d-flex flex-wrap gap-1">
                    {profile.apps.slice(0, 3).map((app, appIndex) => (
                      <span 
                        key={appIndex}
                        className="badge rounded-pill d-flex align-items-center gap-1 app-badge"
                      >
                        {getAppTypeIcon(app.type)}
                        <span className="d-none d-sm-inline text-capitalize">
                          {app.type}
                        </span>
                      </span>
                    ))}
                    {profile.apps.length > 3 && (
                      <small className="opacity-75">+{profile.apps.length - 3}</small>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Profile Card */}
          <div className="col-6 col-md-4 col-lg-3">
            <div className="card h-100 add-profile-card text-center d-flex justify-content-center align-items-center">
              <div className="card-body p-3 d-flex flex-column justify-content-center align-items-center">
                <div className="rounded-circle d-flex justify-content-center align-items-center mb-2 add-profile-icon">
                  <Plus size={16} />
                </div>
                <small className="fw-medium text-muted">Add Profile</small>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-light rounded p-3">
          <div className="row text-center g-0">
            <div className="col-4">
              <div className="h5 fw-bold text-primary mb-1">
                {profilesData.length}
              </div>
              <small className="text-muted">Profiles</small>
            </div>
            <div className="col-4">
              <div className="h5 fw-bold text-success mb-1">
                {profilesData.reduce((total, profile) => total + profile.apps.length, 0)}
              </div>
              <small className="text-muted">Apps</small>
            </div>
            <div className="col-4">
              <div className="h5 fw-bold text-info mb-1">
                {profilesData.reduce((total, profile) => total + getAppCount(profile.apps), 0)}
              </div>
              <small className="text-muted">Items</small>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile_screen;