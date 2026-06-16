import axios from "axios";

const DEVOTEE_BASE = "http://localhost:5000/api/devotee";
const DONATION_BASE = "http://localhost:5000/api/donations";
const STAFF_BASE = "http://localhost:5000/api/staff";

export const getAdminBookings = async () => {
  const response = await axios.get(`${DEVOTEE_BASE}/bookings`);
  return response.data;
};

export const getAdminDonations = async () => {
  const response = await axios.get(`${DEVOTEE_BASE}/donations`);
  return response.data;
};

export const getAdminDonationStats = async () => {
  const response = await axios.get(`${DONATION_BASE}/stats`);
  return response.data;
};

export const getAdminPrasadamOrders = async () => {
  const response = await axios.get(`${DEVOTEE_BASE}/prasadam-orders`);
  return response.data;
};

export const getAdminInventoryCatalog = async () => {
  const response = await axios.get(`${STAFF_BASE}/inventory/catalog`);
  return response.data;
};

export const getAdminEventOverview = async () => {
  const response = await axios.get(`${DEVOTEE_BASE}/events/overview`);
  return response.data;
};

export const getAdminAttendanceDashboard = async (month) => {
  const params = month ? { month } : {};
  const response = await axios.get(`${STAFF_BASE}/attendance/admin/dashboard`, { params });
  return response.data;
};

export const getAdminEmployees = async () => {
  const response = await axios.get(`http://localhost:5000/api/employees`);
  return response.data;
};

export const getAdminEvents = async () => {
  const response = await axios.get(`${DEVOTEE_BASE}/events`);
  return response.data;
};
