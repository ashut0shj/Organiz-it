import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

export default function LoginPopup({ onClose }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="login-popup-overlay">
        <div className="login-popup-container">
          <button onClick={onClose} className="login-popup-close">&times;</button>
          <h2 className="login-popup-title">Sign in to Organiz-it</h2>
          <GoogleLogin
            onSuccess={async credentialResponse => {
              const res = await fetch(`${API_BASE}/api/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: credentialResponse.credential }),
              });
              const data = await res.json();
              if (data.user) {
                login(data.user);
                console.log('Login successful');
                navigate('/');
              }
            }}
            onError={() => {}}
            width="100%"
          />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
} 