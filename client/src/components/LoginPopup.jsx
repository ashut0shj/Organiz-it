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
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
      }}>
        <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 8px 32px rgba(106,73,255,0.10)', padding: 32, minWidth: 320, textAlign: 'center', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>&times;</button>
          <h2 style={{ marginBottom: 24, color: '#6a49ff' }}>Sign in to Organiz-it</h2>
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