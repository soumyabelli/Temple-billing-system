import axios from "axios";

const API_BASE = "http://localhost:5000/api/poojas";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: token ? `Bearer ${token}` : "" } };
};

export const getPoojaTypes = async () => {
  try {
    const response = await axios.get(API_BASE, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Failed to fetch pooja types:", error);
    return [];
  }
};

export const getPoojaTypeById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE}/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Failed to fetch pooja type by id:", error);
    return null;
  }
};

export const savePoojaType = async (payload) => {
  try {
    const response = await axios.post(API_BASE, payload, getAuthHeaders());
    return response.data.pooja;
  } catch (error) {
    console.error("Failed to save pooja type:", error);
    throw error;
  }
};

export const updatePoojaType = async (id, payload) => {
  try {
    const response = await axios.put(`${API_BASE}/${id}`, payload, getAuthHeaders());
    return response.data.pooja;
  } catch (error) {
    console.error("Failed to update pooja type:", error);
    throw error;
  }
};

export const removePoojaType = async (id) => {
  try {
    await axios.delete(`${API_BASE}/${id}`, getAuthHeaders());
    return true;
  } catch (error) {
    console.error("Failed to remove pooja type:", error);
    return false;
  }
};
