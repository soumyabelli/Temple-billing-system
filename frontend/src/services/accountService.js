import axios from "axios";

const API_URL = "http://localhost:5000/api/accounts"; // Adjust if base url is dynamic

// Utility for authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

// --- Expense Categories ---
export const getExpenseCategories = async () => {
  const res = await axios.get(`${API_URL}/categories`, getAuthHeaders());
  return res.data;
};

export const createExpenseCategory = async (data) => {
  const res = await axios.post(`${API_URL}/categories`, data, getAuthHeaders());
  return res.data;
};

// --- Transactions ---
export const getTransactions = async (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  const res = await axios.get(`${API_URL}/transactions?${query}`, getAuthHeaders());
  return res.data;
};

export const createManualExpense = async (data) => {
  const res = await axios.post(`${API_URL}/manual-expense`, data, getAuthHeaders());
  return res.data;
};

export const approveExpense = async (id, status) => {
  const res = await axios.put(`${API_URL}/expense/${id}/approve`, { status }, getAuthHeaders());
  return res.data;
};

export const addBankInterest = async (data) => {
  const res = await axios.post(`${API_URL}/bank-interest`, data, getAuthHeaders());
  return res.data;
};

// --- Dashboards & Reports ---
export const getDashboardMetrics = async () => {
  const res = await axios.get(`${API_URL}/dashboard-metrics`, getAuthHeaders());
  return res.data;
};

const buildReportQuery = (params) => {
  if (!params) return "";
  if (typeof params === "string") return `?financialYear=${encodeURIComponent(params)}`;
  const searchParams = new URLSearchParams();
  if (params.financialYear) searchParams.append("financialYear", params.financialYear);
  if (params.fromDate) searchParams.append("fromDate", params.fromDate);
  if (params.toDate) searchParams.append("toDate", params.toDate);
  const str = searchParams.toString();
  return str ? `?${str}` : "";
};

export const getProfitLoss = async (params) => {
  const query = buildReportQuery(params);
  const res = await axios.get(`${API_URL}/profit-loss${query}`, getAuthHeaders());
  return res.data;
};

export const getMonthlyReport = async (params) => {
  const query = buildReportQuery(params);
  const res = await axios.get(`${API_URL}/monthly-report${query}`, getAuthHeaders());
  return res.data;
};

export const getAnnualReport = async (params) => {
  const query = buildReportQuery(params);
  const res = await axios.get(`${API_URL}/annual-report${query}`, getAuthHeaders());
  return res.data;
};

// --- Cash Closing & Shift Reconciliation ---
export const getShiftSummary = async (date) => {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  const res = await axios.get(`${API_URL}/shift-summary${query}`, getAuthHeaders());
  return res.data;
};

export const getCashClosings = async () => {
  const res = await axios.get(`${API_URL}/cash-closing`, getAuthHeaders());
  return res.data;
};

export const submitCashClosing = async (data) => {
  const res = await axios.post(`${API_URL}/cash-closing`, data, getAuthHeaders());
  return res.data;
};

export const verifyCashClosing = async (id, status) => {
  const res = await axios.put(`${API_URL}/cash-closing/${id}/verify`, { status }, getAuthHeaders());
  return res.data;
};
