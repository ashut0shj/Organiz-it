import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("authUser");
    const token = localStorage.getItem("authToken");
    console.log('AuthContext: Initializing with stored data:', { stored: !!stored, token: !!token });
    return stored && token ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem("authToken") || null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('AuthContext: User state changed:', { user: !!user, token: !!token });
    if (user && token) {
      localStorage.setItem("authUser", JSON.stringify(user));
      localStorage.setItem("authToken", token);
      console.log('AuthContext: Saved to localStorage');
    } else {
      localStorage.removeItem("authUser");
      localStorage.removeItem("authToken");
      console.log('AuthContext: Cleared localStorage');
    }
  }, [user, token]);

  const login = (userData, jwtToken) => {
    console.log('AuthContext: Login called with:', { userData, token: !!jwtToken });
    setUser(userData);
    setToken(jwtToken);
  };

  const logout = () => {
    console.log('AuthContext: Logout called');
    setUser(null);
    setToken(null);
  };

  const checkAuth = async () => {
    if (!token) return false;
    
    try {
      const response = await fetch("http://localhost:8000/verify-token", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      return response.ok;
    } catch (error) {
      console.error("Auth check failed:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      setLoading,
      login, 
      logout, 
      checkAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 