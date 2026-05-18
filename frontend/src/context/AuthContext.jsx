import { createContext, useContext, useMemo, useState } from "react";
import { clearAuth, getStoredToken, getStoredUser, setAuth } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());
  const [token, setToken] = useState(getStoredToken());

  const loginUser = (authPayload) => {
    setAuth(authPayload);
    setUser(authPayload.user);
    setToken(authPayload.token);
  };

  const logoutUser = () => {
    clearAuth();
    setUser(null);
    setToken(null);
  };

  const value = useMemo(
    () => ({ user, token, isAuthenticated: Boolean(token && user), loginUser, logoutUser }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
