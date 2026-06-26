import axios from "axios";

const API_BASE = "http://localhost:5000/api/bookings";

export const getDashboardBookings = async () => {
  const response = await axios.get(`${API_BASE}/dashboard`);
  return response.data;
};

export const getAllBookings = async (params = {}) => {
  const response = await axios.get(`${API_BASE}/all`, { params });
  return response.data;
};

export const getBookingById = async (id) => {
  const response = await axios.get(`${API_BASE}/${id}`);
  return response.data;
};

export const updateBookingStatusAdmin = async (id, status, note = "", updatedBy = "Admin") => {
  const response = await axios.patch(`${API_BASE}/${id}/status`, { status, note, updatedBy });
  return response.data;
};

export const getBookingReceipt = async (bookingId) => {
  const response = await axios.get(`${API_BASE}/receipt/${bookingId}`);
  return response.data;
};
