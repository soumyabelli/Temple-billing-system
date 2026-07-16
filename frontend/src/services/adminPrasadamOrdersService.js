import axios from "axios";

const API_BASE = "http://localhost:5000/api";

const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const getAdminPrasadamOrders = async ({
  search = "",
  status = "",
  startDate = "",
  endDate = "",
  page = 1,
  limit = 10,
} = {}) => {
  const response = await axios.get(`${API_BASE}/admin/prasadam-orders`, {
    ...authConfig(),
    params: {
      search,
      status,
      startDate,
      endDate,
      page,
      limit,
    },
  });
  return response.data;
};

export const getAdminPrasadamOrderById = async (id) => {
  const response = await axios.get(`${API_BASE}/admin/prasadam-orders/${id}`, authConfig());
  return response.data;
};

export const updateAdminPrasadamOrderStatus = async ({ id, status, adminReason = "" }) => {
  const response = await axios.put(`${API_BASE}/admin/prasadam-orders/${id}/status`, {
    status,
    adminReason,
  }, authConfig());
  return response.data;
};

export const deleteAdminPrasadamOrder = async (id) => {
  const response = await axios.delete(`${API_BASE}/admin/prasadam-orders/${id}`, authConfig());
  return response.data;
};
