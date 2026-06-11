import axios from "axios";

const API_BASE = "http://localhost:5000/api/staff/attendance";

export const getStaffAttendanceDashboard = async (staffId, month) => {
  const response = await axios.get(`${API_BASE}/${staffId}/dashboard`, {
    params: month ? { month } : undefined,
  });
  return response.data;
};

export const getStaffAttendanceSummary = async (staffId, month) => {
  const response = await axios.get(`${API_BASE}/${staffId}/summary`, {
    params: month ? { month } : undefined,
  });
  return response.data;
};

export const getAdminAttendanceDashboard = async (month, employeeId) => {
  const params = {};
  if (month) params.month = month;
  if (employeeId) params.employeeId = employeeId;

  const response = await axios.get(`${API_BASE}/admin/dashboard`, {
    params: Object.keys(params).length ? params : undefined,
  });
  return response.data;
};

export const markAttendance = async (attendanceData) => {
  const response = await axios.post(`${API_BASE}/mark`, attendanceData);
  return response.data;
};

export const updateAttendance = async (attendanceId, payload) => {
  const response = await axios.put(`${API_BASE}/${attendanceId}`, payload);
  return response.data;
};
