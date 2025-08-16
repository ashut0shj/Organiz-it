import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Load user from localStorage on initial load
    const stored = localStorage.getItem("auth");
    return stored ? JSON.parse(stored) : null;
  });

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("auth", JSON.stringify(user));
    } else {
      localStorage.removeItem("auth");
    }
  }, [user]);

  /**
   * NEW FUNCTION: Handles the server-side OAuth flow.
   * This function sends the authorization code received from Electron
   * to your FastAPI backend.
   * @param {string} code The authorization code from Google.
   */
  const loginWithCode = async (code) => {
    try {
      // Your backend needs an endpoint like '/auth/google' to handle this
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const userData = await response.json();
      // Your backend should return a user object with name, email, picture, etc.
      setUser(userData);

    } catch (error) {
      console.error("Google login failed:", error);
      // Handle login error (e.g., show a notification)
      setUser(null);
    }
  };

  const logout = () => {
    setUser(null);
  };

  // The 'login' function is kept in case you have other login methods.
  const login = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loginWithCode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
