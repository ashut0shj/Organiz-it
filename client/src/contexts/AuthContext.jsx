import React, { createContext, useContext, useState, useEffect } from "react";
import * as jwt_decode from 'jwt-decode';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("auth");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("auth", JSON.stringify(user));
    } else {
      localStorage.removeItem("auth");
    }
  }, [user]);

  const login = (userData) => {
    let user = userData;
    if (userData.credential) {
      user = jwt_decode.default ? jwt_decode.default(userData.credential) : jwt_decode(userData.credential);
    }
    setUser(user);
  };
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 