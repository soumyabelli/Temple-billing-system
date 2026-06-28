import axios from "axios";
import { getStoredToken } from "./authService";

const API_BASE = "http://localhost:5000/api/employees";

const authConfig = () => {
  const token = getStoredToken();
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const getEmployees = async (params = {}) => {
  const response = await axios.get(API_BASE, {
    ...authConfig(),
    params: Object.keys(params).length ? params : undefined,
  });
  return response.data;
};

export const getEmployee = async (id) => {
  const response = await axios.get(`${API_BASE}/${id}`, authConfig());
  return response.data;
};

export const createEmployee = async (employeeData) => {
  const response = await axios.post(`${API_BASE}/create`, employeeData, authConfig());
  return response.data;
};

export const updateEmployee = async (id, employeeData) => {
  const response = await axios.put(`${API_BASE}/${id}`, employeeData, authConfig());
  return response.data;
};

export const getEmployeeProfile = async (userId) => {
  const response = await axios.get(`${API_BASE}/profile/${userId}`, authConfig());
  return response.data;
};

export const updateEmployeeProfile = async (userId, profileData) => {
  const response = await axios.put(`${API_BASE}/profile/${userId}`, profileData, authConfig());
  return response.data;
};

export const changeEmployeePassword = async (userId, passwordData) => {
  const response = await axios.put(`${API_BASE}/profile/${userId}/password`, passwordData, authConfig());
  return response.data;
};

export const deleteEmployee = async (id, status = "Inactive") => {
  const response = await axios.delete(`${API_BASE}/${id}`, {
    ...authConfig(),
    data: { status },
  });
  return response.data;
};
