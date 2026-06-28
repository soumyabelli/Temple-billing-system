import axios from "axios";
import { getStoredToken } from "./authService";

const API_BASE = "http://localhost:5000/api/staff/attendance";

const authConfig = () => {
  const token = getStoredToken();
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const getStaffAttendanceDashboard = async (staffId, month) => {
  const response = await axios.get(`${API_BASE}/${staffId}/dashboard`, {
    ...authConfig(),
    params: month ? { month } : undefined,
  });
  return response.data;
};

export const getStaffAttendanceSummary = async (staffId, month) => {
  const response = await axios.get(`${API_BASE}/${staffId}/summary`, {
    ...authConfig(),
    params: month ? { month } : undefined,
  });
  return response.data;
};

export const getAdminAttendanceDashboard = async (month, employeeId, extraParams = {}) => {
  const params = {};
  if (month) params.month = month;
  if (employeeId) params.employeeId = employeeId;
  Object.entries(extraParams || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params[key] = value;
    }
  });

  const response = await axios.get(`${API_BASE}/admin/dashboard`, {
    ...authConfig(),
    params: Object.keys(params).length ? params : undefined,
  });
  return response.data;
};

export const markAttendance = async (attendanceData) => {
  const response = await axios.post(`${API_BASE}/mark`, attendanceData, authConfig());
  return response.data;
};

export const updateAttendance = async (attendanceId, payload) => {
  const response = await axios.put(`${API_BASE}/${attendanceId}`, payload, authConfig());
  return response.data;
};
