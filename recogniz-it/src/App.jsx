import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProfileScreen from './components/ProfileScreen';
import OAuthCallback from './components/OAuthCallback';
import { useAuth } from './auth/AuthContext';
import './App.css';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AppContent() {
  const { user } = useAuth();

  // Simple routing based on URL path for OAuth callback
  const path = window.location.pathname;
  
  console.log('AppContent: Current path:', path);
  console.log('AppContent: User state:', !!user);
  
  if (path === '/oauth-callback') {
    console.log('AppContent: Rendering OAuthCallback');
    return <OAuthCallback />;
  }
  
  if (path === '/error') {
    console.log('AppContent: Rendering Error page');
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '18px',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div>
          <h2>Authentication Error</h2>
          <p>Something went wrong during login. Please try again.</p>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              background: 'white',
              color: '#667eea',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              marginTop: '20px'
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  console.log('AppContent: Rendering main app - user:', !!user);
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          <Route path="/error" element={
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontSize: '18px',
              textAlign: 'center',
              padding: '20px'
            }}>
              <div>
                <h2>Authentication Error</h2>
                <p>Something went wrong during login. Please try again.</p>
                <button 
                  onClick={() => window.location.href = '/'}
                  style={{
                    background: 'white',
                    color: '#667eea',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    marginTop: '20px'
                  }}
                >
                  Go Back
                </button>
              </div>
            </div>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/profiles" element={
            <PrivateRoute>
              <ProfileScreen />
            </PrivateRoute>
          } />
          <Route path="/" element={<AppContent />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
