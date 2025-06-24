import React from "react";
import "../stylesheets/login.css";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    // Simulate login (replace with real auth logic)
    const userData = {
      name: "Demo User",
      email: "demo@example.com",
      picture: "https://i.pravatar.cc/150?img=3"
    };
    login(userData);
    navigate("/profile");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <div className="logo-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="app-title">organiz-it</h1>
          </div>
          <p className="app-subtitle">
            Organize your links, simplify your browsing
          </p>
        </div>

        <div className="login-content">
          <div className="welcome-text">
            <h2>Welcome Back!</h2>
            <p>Sign in to access your saved links and collections</p>
          </div>

          <button onClick={handleLogin} className="google-login-button">
            <svg
              className="google-icon"
              viewBox="0 0 24 24"
              width="20"
              height="20"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="features-preview">
            <div className="feature-item">
              <div className="feature-icon">🔗</div>
              <span>Save Links</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">👥</div>
              <span>User Profiles</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🗂️</div>
              <span>Link Collections</span>
            </div>
          </div>

          <p className="login-footer">
            By signing in, you agree to our{" "}
            <a href="#" className="login-link">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="login-link">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      <div className="background-decoration">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>
    </div>
  );
};

export default Login;
