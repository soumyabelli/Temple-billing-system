import axios from "axios";

const API_BASE = "http://localhost:5000/api";

export const getAdminPrasadamOrders = async ({
  search = "",
  status = "",
  startDate = "",
  endDate = "",
  page = 1,
  limit = 10,
} = {}) => {
  const response = await axios.get(`${API_BASE}/admin/prasadam-orders`, {
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
  const response = await axios.get(`${API_BASE}/admin/prasadam-orders/${id}`);
  return response.data;
};

export const updateAdminPrasadamOrderStatus = async ({ id, status, adminReason = "" }) => {
  const response = await axios.put(`${API_BASE}/admin/prasadam-orders/${id}/status`, {
    status,
    adminReason,
  });
  return response.data;
};

