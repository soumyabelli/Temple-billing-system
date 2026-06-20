import axios from "axios";
import { getStoredToken } from "./authService";

const API_BASE = "http://localhost:5000/api";

// Helper to get auth headers with JWT token
const getAuthHeaders = () => {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get priest dashboard data (includes stats, schedules, duties, and announcements)
export const getPriestDashboard = async () => {
  try {
    const response = await axios.get(`${API_BASE}/priest/dashboard`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching priest dashboard:", error);
    throw error;
  }
};

// Get priest's today schedule
export const getPriestTodaySchedule = async () => {
  try {
    const response = await axios.get(`${API_BASE}/priest/today-schedule`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching today's schedule:", error);
    throw error;
  }
};

// Get priest's upcoming poojas
export const getPriestUpcomingPoojas = async () => {
  try {
    const response = await axios.get(`${API_BASE}/priest/upcoming-poojas`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching upcoming poojas:", error);
    throw error;
  }
};

// Get priest's completed services
export const getPriestCompletedServices = async () => {
  try {
    const response = await axios.get(`${API_BASE}/priest/completed-today`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching completed services:", error);
    throw error;
  }
};

// Get priest's seva duties
export const getPriestSevaDuties = async (priestId) => {
  try {
    // Falls back to staff tasks endpoint if priestId is provided, or gets it from dashboard
    const response = await axios.get(`${API_BASE}/staff/tasks/${priestId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching seva duties:", error);
    throw error;
  }
};

// Get announcements
export const getPriestAnnouncements = async () => {
  try {
    const response = await axios.get(`${API_BASE}/devotee/notifications`, {
      headers: getAuthHeaders(),
    });
    return response.data.notifications;
  } catch (error) {
    console.error("Error fetching announcements:", error);
    throw error;
  }
};

// Update pooja status
export const updatePoojaStatus = async (poojaId, status) => {
  try {
    const response = await axios.patch(
      `${API_BASE}/priest/bookings/${poojaId}/status`,
      { status },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating pooja status:", error);
    throw error;
  }
};

// Get priest's profile
export const getPriestProfile = async () => {
  try {
    const response = await axios.get(`${API_BASE}/devotee/profile`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching priest profile:", error);
    throw error;
  }
};

// Get devotee list
export const getDevotees = async () => {
  try {
    // Get devotee user list
    const response = await axios.get(`${API_BASE}/devotee/profile`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching devotees:", error);
    throw error;
  }
};

// Fetch poojas assigned to logged-in priest
export const getAssignedPoojas = async (status = "All", search = "") => {
  try {
    const response = await axios.get(`${API_BASE}/priest/assigned-poojas`, {
      params: { status, search },
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching assigned poojas:", error);
    throw error;
  }
};

// Update pooja status to In Progress
export const startPooja = async (poojaId) => {
  try {
    const response = await axios.put(
      `${API_BASE}/priest/start-pooja/${poojaId}`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("Error starting pooja:", error);
    throw error;
  }
};

// Update pooja status to Completed
export const completePooja = async (poojaId) => {
  try {
    const response = await axios.put(
      `${API_BASE}/priest/complete-pooja/${poojaId}`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("Error completing pooja:", error);
    throw error;
  }
};

// Update pooja status to Pending with a mandatory reason
export const putPoojaPending = async (poojaId, pendingReason) => {
  try {
    const response = await axios.put(
      `${API_BASE}/priest/pending-pooja/${poojaId}`,
      { pendingReason },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("Error putting pooja pending:", error);
    throw error;
  }
};

// Fetch today's seva schedule assigned to logged-in priest
export const getSevaSchedule = async () => {
  try {
    const response = await axios.get(`${API_BASE}/priest/seva-schedule`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching seva schedule:", error);
    throw error;
  }
};

// Fetch special instructions from admin instructions collection
export const getSevaInstructions = async () => {
  try {
    const response = await axios.get(`${API_BASE}/priest/seva-instructions`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching seva instructions:", error);
    throw error;
  }
};

// Fetch inventory items required for today's sevas
export const getMaterialChecklist = async () => {
  try {
    const response = await axios.get(`${API_BASE}/priest/material-checklist`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching material checklist:", error);
    throw error;
  }
};

// --- MODULE 3: COMPLETED SERVICES ---
export const getCompletedServicesFilter = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE}/priest/completed-services`, {
      params,
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching completed services:", error);
    throw error;
  }
};

// --- MODULE 4: SPECIAL DUTIES ---
export const getSpecialDuties = async () => {
  try {
    const response = await axios.get(`${API_BASE}/priest/special-duties`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching special duties:", error);
    throw error;
  }
};

export const acceptSpecialDuty = async (id) => {
  try {
    const response = await axios.put(`${API_BASE}/priest/accept-duty/${id}`, {}, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const rejectSpecialDuty = async (id, rejectionReason) => {
  try {
    const response = await axios.put(`${API_BASE}/priest/reject-duty/${id}`, { rejectionReason }, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const completeSpecialDuty = async (id) => {
  try {
    const response = await axios.put(`${API_BASE}/priest/complete-duty/${id}`, {}, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// --- MODULE 5: FESTIVAL DUTIES ---
export const getFestivalDuties = async () => {
  try {
    const response = await axios.get(`${API_BASE}/priest/festival-duties`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const markFestivalDutyAttendance = async (id) => {
  try {
    const response = await axios.put(`${API_BASE}/priest/festival-duty-attendance/${id}`, {}, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const completeFestivalDuty = async (id) => {
  try {
    const response = await axios.put(`${API_BASE}/priest/festival-duty-complete/${id}`, {}, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// --- MODULE 6: NOTIFICATIONS ---
export const getNotifications = async () => {
  try {
    const response = await axios.get(`${API_BASE}/priest/notifications`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const readNotification = async (id) => {
  try {
    const response = await axios.put(`${API_BASE}/priest/notifications/read/${id}`, {}, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const readAllNotifications = async () => {
  try {
    const response = await axios.put(`${API_BASE}/priest/notifications/read-all`, {}, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// --- MODULE 7: PROFILE ---
export const getProfile = async () => {
  try {
    const response = await axios.get(`${API_BASE}/priest/profile`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await axios.put(`${API_BASE}/priest/profile`, profileData, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// --- MODULE 8: SETTINGS ---
export const getSettings = async () => {
  try {
    const response = await axios.get(`${API_BASE}/priest/settings`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateSettings = async (settingsData) => {
  try {
    const response = await axios.put(`${API_BASE}/priest/settings`, settingsData, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    throw error;
  }
};
