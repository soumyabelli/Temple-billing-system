import { createContext, useContext, useMemo, useState } from "react";
import { clearAuth, getStoredToken, getStoredUser, setAuth } from "../services/authService";

const AuthContext = createContext(null);

const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    role: String(user.role || "").toLowerCase(),
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(normalizeUser(getStoredUser()));
  const [token, setToken] = useState(getStoredToken());

  const loginUser = (authPayload) => {
    const normalized = {
      ...authPayload,
      user: normalizeUser(authPayload.user),
    };
    setAuth(normalized);
    setUser(normalized.user);
    setToken(normalized.token);
  };

  const updateUser = (newUser) => {
    const normalizedUser = normalizeUser(newUser);
    setUser(normalizedUser);
    const storedToken = getStoredToken();
    if (storedToken) {
      setAuth({ token: storedToken, user: normalizedUser });
      setToken(storedToken);
    } else {
      localStorage.setItem("user", JSON.stringify(normalizedUser));
    }
  };

  const logoutUser = () => {
    clearAuth();
    setUser(null);
    setToken(null);
  };

  const value = useMemo(
    () => ({ user, token, isAuthenticated: Boolean(token && user), loginUser, updateUser, logoutUser }),
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
