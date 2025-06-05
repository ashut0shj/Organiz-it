import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Settings, LogOut, Rocket } from "lucide-react";
import "../stylesheets/dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const email = query.get("email");
    const name = query.get("name");
    const picture = query.get("picture");

    if (email && name) {
      setUserInfo({ email, name, picture: picture || "" });
    }
  }, [location]);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <Rocket size={20} />
            </div>
            <h1 className="app-title">Workspacer</h1>
          </div>

          {userInfo && (
            <div className="header-buttons">
              <button className="btn btn-ghost btn-sm">
                <Settings size={16} />
                Settings
              </button>
              <button className="btn btn-ghost btn-sm">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Welcome Section */}
        <div className="welcome-section animate-fade-in">
          <h2 className="welcome-title">Welcome to your Workspace</h2>
          <p className="welcome-description">
            Organize your applications, streamline your workflow, and boost your productivity with intelligent workspace management.
          </p>
        </div>


        {/* Quick Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <h3>Total Workspaces</h3>
                <p className="stat-number">5</p>
              </div>
              <div className="stat-icon blue">
                <Settings size={24} />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <h3>Applications</h3>
                <p className="stat-number">24</p>
              </div>
              <div className="stat-icon green">
                <Rocket size={24} />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <h3>Last Launch</h3>
                <p className="stat-number">2h</p>
              </div>
              <div className="stat-icon purple">
                <User size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="cta-section">
          <div className="cta-card">
            <h3 className="cta-title">Ready to get productive?</h3>
            <p className="cta-description">
              Access your personalized workspaces and launch all your essential applications with a single click.
            </p>
            <button
              onClick={() => navigate("/profile")}
              className="btn btn-secondary btn-lg"
            >
              <Rocket size={20} />
              Go to Workspaces
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
