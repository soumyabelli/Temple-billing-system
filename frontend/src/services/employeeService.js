import axios from "axios";

const API_BASE = "http://localhost:5000/api/employees";

export const getEmployees = async () => {
  const response = await axios.get(API_BASE);
  return response.data;
};

export const getEmployee = async (id) => {
  const response = await axios.get(`${API_BASE}/${id}`);
  return response.data;
};

export const createEmployee = async (employeeData) => {
  const response = await axios.post(`${API_BASE}/create`, employeeData);
  return response.data;
};

export const updateEmployee = async (id, employeeData) => {
  const response = await axios.put(`${API_BASE}/${id}`, employeeData);
  return response.data;
};

export const deleteEmployee = async (id) => {
  const response = await axios.delete(`${API_BASE}/${id}`);
  return response.data;
};
