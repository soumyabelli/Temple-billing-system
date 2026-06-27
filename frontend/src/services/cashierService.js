import axios from "axios";
import { getPoojaTypes } from "./poojaTypeService";
import { getDonationTypes } from "./donationTypeService";
import { getPrasadamTypes, defaultPrasadamTypes } from "./prasadamTypeService";
import { getEmployeeProfile, updateEmployeeProfile, changeEmployeePassword } from "./employeeService";

export const API_BASE = "http://localhost:5000/api";

export const toNumber = (value) => {
  const normalized = Number(String(value ?? "").replace(/[^0-9.-]+/g, ""));
  return Number.isNaN(normalized) ? 0 : normalized;
};

export const formatCurrency = (value) => `Rs ${toNumber(value).toLocaleString("en-IN")}`;

export const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const buildReceiptNo = (prefix, sourceId, index = 0) => {
  const suffix = sourceId ? String(sourceId).slice(-6).toUpperCase() : String(index + 1).padStart(4, "0");
  return `${prefix}-${suffix}`;
};

export const toDateKey = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const isToday = (value) => toDateKey(value) === toDateKey(new Date());

export const inferBillType = (bill = {}) => {
  const explicit = String(bill.billType || "").trim();
  if (explicit) return explicit;

  const raw = String(bill.sevaType || "").toLowerCase();
  if (!raw) return "Other";
  if (raw.includes("donat") || raw.includes("festival")) return "Donation";
  if (raw.includes("prasadam") || raw.includes("laddu") || raw.includes("pongal") || raw.includes("rice")) return "Prasadam Sale";
  if (raw.includes("pooja") || raw.includes("archana") || raw.includes("seva") || raw.includes("homa") || raw.includes("abhis")) return "Pooja Booking";
  return "Other";
};

export const getBillReference = (bill, index = 0) => {
  const prefix = inferBillType(bill) === "Donation" ? "DN" : inferBillType(bill) === "Prasadam Sale" ? "PR" : "BK";
  return bill.referenceNo || buildReceiptNo(prefix, bill._id || bill.sourceId || "", index);
};

export const sumBy = (items, selector) =>
  (Array.isArray(items) ? items : []).reduce((sum, item, index) => sum + Number(selector(item, index) || 0), 0);

export const getCashierCatalogs = () => ({
  poojaTypes: getPoojaTypes(),
  donationTypes: getDonationTypes(),
  prasadamTypes: getPrasadamTypes(),
  defaultPrasadamTypes,
});

export const fetchBookings = async () => {
  const response = await axios.get(`${API_BASE}/devotee/bookings`);
  return response.data?.bookings || [];
};

export const createBooking = async (payload) => {
  const response = await axios.post(`${API_BASE}/devotee/bookings`, payload);
  return response.data?.booking || null;
};

export const updateBookingStatus = async (id, status) => {
  const response = await axios.patch(`${API_BASE}/devotee/bookings/${id}/status`, { status });
  return response.data?.booking || null;
};

export const fetchDonations = async () => {
  const response = await axios.get(`${API_BASE}/devotee/donations`);
  return response.data?.donations || [];
};

export const createDonation = async (payload) => {
  const response = await axios.post(`${API_BASE}/devotee/donations`, payload);
  return response.data?.donation || null;
};

export const fetchPrasadamOrders = async () => {
  const response = await axios.get(`${API_BASE}/devotee/prasadam-orders`);
  return response.data?.orders || [];
};

export const createPrasadamOrder = async (payload) => {
  const response = await axios.post(`${API_BASE}/devotee/prasadam-orders`, payload);
  return response.data?.order || null;
};

export const fetchPrasadamMaster = async () => {
  const response = await axios.get(`${API_BASE}/prasadam`);
  return response.data?.items || [];
};

export const cancelPrasadamOrder = async (id) => {
  const response = await axios.patch(`${API_BASE}/devotee/prasadam-orders/${id}/cancel`);
  return response.data?.order || null;
};

export const fetchBills = async () => {
  const response = await axios.get(`${API_BASE}/bills`);
  const data = response.data;
  return Array.isArray(data) ? data : data?.bills || data?.items || [];
};

export const createBill = async (payload) => {
  const response = await axios.post(`${API_BASE}/bills`, payload);
  return response.data || null;
};

export const fetchEvents = async () => {
  const response = await axios.get(`${API_BASE}/devotee/events`);
  return response.data?.events || [];
};

export const fetchInventoryItems = async () => {
  const response = await axios.get(`${API_BASE}/admin/inventory-items`);
  return response.data?.items || [];
};

export const fetchNotifications = async (userId) => {
  const response = await axios.get(`${API_BASE}/notifications/cashier/${userId || "cashier"}`);
  const data = response.data;
  return Array.isArray(data) ? data : data?.notifications || [];
};

export const createCashierNotification = async (payload) => {
  const response = await axios.post(`${API_BASE}/devotee/notifications`, payload);
  return response.data || null;
};

export const markNotificationRead = async (notificationId) => {
  const response = await axios.put(`${API_BASE}/notifications/read/${notificationId}`);
  return response.data || null;
};

export const registerDevotee = async (payload) => {
  const response = await axios.post(`${API_BASE}/auth/register`, payload);
  return response.data || null;
};

export const loadCashierProfile = async (userId) => {
  const response = await getEmployeeProfile(userId);
  return response;
};

export const saveCashierProfile = async (userId, payload) => {
  const response = await updateEmployeeProfile(userId, payload);
  return response;
};

export const changeCashierPassword = async (userId, payload) => {
  const response = await changeEmployeePassword(userId, payload);
  return response;
};
