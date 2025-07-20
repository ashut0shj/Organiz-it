import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';

import ProfileLauncher from "./components/profiles";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const { user } = useAuth();
  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          <>
                          <Navbar profiles={[]} />
              <div className="workspacer-container" >
                <h2 style={{ color: 'black' }}>Please login </h2>
              </div>
          </>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <ProfileLauncher />
          </ProtectedRoute>
        } />
        <Route path="*" element={user ? <Navigate to="/" replace /> : <Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
