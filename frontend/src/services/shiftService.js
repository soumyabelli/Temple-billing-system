import axios from "axios";

const API_BASE = "http://localhost:5000/api/shifts";

export const getShiftDashboard = async (weekStart) => {
  const response = await axios.get(`${API_BASE}/dashboard`, {
    params: weekStart ? { weekStart } : {},
  });
  return response.data;
};

export const getShifts = async () => {
  const response = await axios.get(API_BASE);
  return response.data;
};

export const createShift = async (payload) => {
  const response = await axios.post(API_BASE, payload);
  return response.data;
};

export const updateShift = async (id, payload) => {
  const response = await axios.put(`${API_BASE}/${id}`, payload);
  return response.data;
};

export const deleteShift = async (id) => {
  const response = await axios.delete(`${API_BASE}/${id}`);
  return response.data;
};

export const assignShift = async (payload) => {
  const response = await axios.post(`${API_BASE}/assign`, payload);
  return response.data;
};

export const deleteAssignment = async (id) => {
  const response = await axios.delete(`${API_BASE}/assign/${id}`);
  return response.data;
};