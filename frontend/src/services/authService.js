import axios from "axios";

const API_BASE = "http://localhost:5000/api/auth";

export const register = async (formData) => {
  const response = await axios.post(`${API_BASE}/register`, formData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await axios.post(`${API_BASE}/login`, credentials);
  return response.data;
};

export const setAuth = ({ token, user }) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getStoredUser = () => {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
};

export const getStoredToken = () => localStorage.getItem("token");
