import React, { useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

const OAuthCallback = () => {
  const { login, setLoading } = useAuth();

  useEffect(() => {
    const handleCallback = () => {
      console.log('OAuthCallback: Processing callback...');
      console.log('Current URL:', window.location.href);
      
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      console.log('Token found:', !!token);
      
      if (token) {
        try {
          // Decode JWT to get user info
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('Decoded payload:', payload);
          
          const userData = {
            email: payload.email,
            name: payload.name,
            picture: payload.picture
          };
          
          console.log('User data:', userData);
          login(userData, token);
          setLoading(false);
          
          // Redirect to home page
          window.location.href = '/';
        } catch (error) {
          console.error('Error processing token:', error);
          setLoading(false);
          window.location.href = '/error';
        }
      } else {
        console.error('No token found in URL');
        setLoading(false);
        window.location.href = '/error';
      }
    };

    handleCallback();
  }, [login, setLoading]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontSize: '18px'
    }}>
      Processing login...
    </div>
  );
};

export default OAuthCallback; 