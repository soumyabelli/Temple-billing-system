import axios from "axios";

const API_BASE = "http://localhost:5000/api/auth";

export const register = async (formData) => {
  const response = await axios.post(`${API_BASE}/register`, formData);
  return response.data;
};

export const sendVerificationLink = async (formData) => {
  const response = await axios.post(`${API_BASE}/send-verification-link`, formData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await axios.post(`${API_BASE}/login`, credentials);
  return response.data;
};

export const googleLogin = async (payload) => {
  const response = await axios.post(`${API_BASE}/google-login`, payload);
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await axios.post(`${API_BASE}/forgot-password`, { email });
  return response.data;
};

export const resetPassword = async (payload) => {
  const response = await axios.post(`${API_BASE}/reset-password`, payload);
  return response.data;
};

export const changePassword = async ({ token, currentPassword, newPassword }) => {
  const response = await axios.post(
    `${API_BASE}/change-password`,
    { currentPassword, newPassword },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const createUserByAdmin = async (userData, token) => {
  const response = await axios.post(`${API_BASE}/admin/create-user`, userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getAdminUsers = async (token) => {
  const response = await axios.get(`${API_BASE}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
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

export const getDevoteesForCashier = async () => {
  const token = getStoredToken();
  const response = await axios.get("http://localhost:5000/api/auth/cashier/devotees", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};
