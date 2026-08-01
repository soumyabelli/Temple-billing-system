import axios from "axios";

const API_BASE = "/api/poojas";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: token ? `Bearer ${token}` : "" } };
};

export const DEFAULT_POOJA_TYPES = [
  { name: "Abhisheka", price: 501, requiredMaterials: "Milk, Curd, Honey, Ghee, Sugar, Flowers, Fruits" },
  { name: "Archana", price: 101, requiredMaterials: "Flowers, Coconut, Betel Leaves, Fruits" },
  { name: "Sahasranama Archana", price: 251, requiredMaterials: "Flowers, Garland, Coconut, Fruits" },
  { name: "Ganapathi Homa", price: 1001, requiredMaterials: "Coconuts, Modak, Ghee, Havan Samagri, Flowers" },
  { name: "Navagraha Shanti Homa", price: 1501, requiredMaterials: "Nine Grains, Ghee, Nine Color Clothes, Flowers" },
  { name: "Satyanarayan Pooja", price: 1201, requiredMaterials: "Wheat Flour, Rava, Sugar, Milk, Fruits, Tulsi" },
  { name: "Maha Mrityunjaya Homa", price: 2101, requiredMaterials: "Ghee, Bilva Leaves, Milk, Honey, Havan Samagri" },
  { name: "Kalyanotsavam", price: 2501, requiredMaterials: "Vastram, Mangalsutra, Turmeric, Kumkum, Flowers, Fruits" },
  { name: "Vehicle Pooja", price: 201, requiredMaterials: "Lemon, Coconut, Flowers, Camphor" },
];

export const getPoojaTypes = async () => {
  try {
    const response = await axios.get(API_BASE, getAuthHeaders());
    const data = response.data?.poojas || response.data || [];
    return data.length > 0 ? data : DEFAULT_POOJA_TYPES;
  } catch (error) {
    console.error("Failed to fetch pooja types:", error);
    return DEFAULT_POOJA_TYPES;
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
