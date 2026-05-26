import axios from "axios";

const API_BASE = "http://localhost:5000/api/devotee";

export const getDevoteeBookings = async () => {
  const response = await axios.get(`${API_BASE}/bookings`);
  return response.data;
};

export const getDevoteeDonations = async () => {
  const response = await axios.get(`${API_BASE}/donations`);
  return response.data;
};

export const getDevoteeNotifications = async () => {
  const response = await axios.get(`${API_BASE}/notifications`);
  return response.data;
};

export const getDevoteeProfile = async () => {
  const response = await axios.get(`${API_BASE}/profile`);
  return response.data;
};

export const getDevoteeEvents = async () => {
  const response = await axios.get(`${API_BASE}/events`);
  return response.data;
};
export const createDevoteeDonation = async (payload) => {
  const response = await axios.post(`${API_BASE}/donations`, payload);
  return response.data;
};
export const createDevoteeBooking = async (payload) => {
  const response = await axios.post(`${API_BASE}/bookings`, payload);
  return response.data;
};

export const submitDevoteeSupport = async (payload) => {
  const response = await axios.post(`${API_BASE}/support`, payload);
  return response.data;
};
