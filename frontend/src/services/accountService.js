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

export const getProfitLoss = async (financialYear) => {
  const query = financialYear ? `?financialYear=${financialYear}` : "";
  const res = await axios.get(`${API_URL}/profit-loss${query}`, getAuthHeaders());
  return res.data;
};

export const getMonthlyReport = async (financialYear) => {
  const query = financialYear ? `?financialYear=${financialYear}` : "";
  const res = await axios.get(`${API_URL}/monthly-report${query}`, getAuthHeaders());
  return res.data;
};

export const getAnnualReport = async (financialYear) => {
  const query = financialYear ? `?financialYear=${financialYear}` : "";
  const res = await axios.get(`${API_URL}/annual-report${query}`, getAuthHeaders());
  return res.data;
};

// --- Cash Closing ---
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
