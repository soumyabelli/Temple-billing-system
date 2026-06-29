import axios from "axios";
import { getStoredToken } from "./authService";

const API_BASE = "http://localhost:5000/api/payroll";

const authConfig = () => {
  const token = getStoredToken();
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const getPayrollDashboard = async (month) => {
  const response = await axios.get(`${API_BASE}/dashboard`, {
    ...authConfig(),
    params: month ? { month } : undefined,
  });
  return response.data;
};

export const payEmployeePayroll = async (employeeId, payload) => {
  const response = await axios.post(`${API_BASE}/${employeeId}/pay`, payload, authConfig());
  return response.data;
};

export const getPerformanceDashboard = async (month) => {
  const response = await axios.get(`${API_BASE}/performance`, {
    ...authConfig(),
    params: month ? { month } : undefined,
  });
  return response.data;
};
