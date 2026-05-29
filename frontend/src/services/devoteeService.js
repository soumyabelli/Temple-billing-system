import axios from "axios";

const API_BASE = "http://localhost:5000/api/devotee";

export const getDevoteeBookings = async (email) => {
  const response = await axios.get(`${API_BASE}/bookings`, { params: email ? { email } : {} });
  return response.data;
};

export const getDevoteeDonations = async (email) => {
  const response = await axios.get(`${API_BASE}/donations`, { params: email ? { email } : {} });
  return response.data;
};

export const getDevoteeNotifications = async (email) => {
  const response = await axios.get(`${API_BASE}/notifications`, { params: email ? { email } : {} });
  return response.data;
};

export const getDevoteeProfile = async (email) => {
  const response = await axios.get(`${API_BASE}/profile`, { params: email ? { email } : {} });
  return response.data;
};
export const updateDevoteeProfile = async (payload) => {
  const response = await axios.put(`${API_BASE}/profile`, payload);
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

export const getSupportRequests = async (email) => {
  const params = email ? { email } : {};
  const response = await axios.get(`${API_BASE}/support`, { params });
  return response.data;
};

export const replySupportRequest = async (id, payload) => {
  const response = await axios.patch(`${API_BASE}/support/${id}`, payload);
  return response.data;
};

export const createNotification = async (payload) => {
  const response = await axios.post(`${API_BASE}/notifications`, payload);
  return response.data;
};

export const getPrasadamOrders = async (email) => {
  const response = await axios.get(`${API_BASE}/prasadam-orders`, { params: email ? { email } : {} });
  return response.data;
};

export const createPrasadamOrder = async (payload) => {
  const response = await axios.post(`${API_BASE}/prasadam-orders`, payload);
  return response.data;
};

export const cancelPrasadamOrder = async (id) => {
  const response = await axios.patch(`${API_BASE}/prasadam-orders/${id}/cancel`);
  return response.data;
};

export const updateBookingStatus = async (id, status) => {
  const response = await axios.patch(`${API_BASE}/bookings/${id}/status`, { status });
  return response.data;
};
