const STORAGE_KEY = "poojaTypes";

const defaultTypes = [
  { name: "Abhisheka",           price: 801,  duration: "45 mins",  description: "Sacred bathing ritual for the deity.", category: "Abhisheka",  requiredMaterials: "Milk, Honey, Curd", status: "Active" },
  { name: "Archana",             price: 501,  duration: "20 mins",  description: "Flower offering with chanting of names.", category: "Archana",    requiredMaterials: "Flowers, Incense", status: "Active" },
  { name: "Special Homa",        price: 1501, duration: "90 mins",  description: "Fire ritual for specific blessings.", category: "Homa",       requiredMaterials: "Wood, Ghee, Rice", status: "Active" },
  { name: "Satyanarayana Puja",  price: 1201, duration: "60 mins",  description: "Puja dedicated to Lord Satyanarayana.", category: "Puja",       requiredMaterials: "Banana, Coconut", status: "Active" },
  { name: "Maha Lakshmi Pooja",  price: 2201, duration: "75 mins",  description: "Special puja for prosperity and wealth.", category: "Puja",       requiredMaterials: "Lotus, Gold", status: "Active" },
];

const normalizeType = (item) => ({
  name:              String(item.name || "").trim(),
  price:             Number(item.price) || 0,
  duration:          String(item.duration || "").trim(),
  description:       String(item.description || "").trim(),
  category:          String(item.category || "").trim(),
  requiredMaterials: String(item.requiredMaterials || "").trim(),
  status:            String(item.status || "Active").trim(),
});

const normalizeTypes = (items) =>
  Array.isArray(items)
    ? items
        .map(normalizeType)
        .filter((item) => item.name && item.price > 0)
        .reduce((acc, item) => {
          if (!acc.some((existing) => existing.name === item.name)) {
            acc.push(item);
          }
          return acc;
        }, [])
    : [];

export const getPoojaTypes = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultTypes;
    const parsed = JSON.parse(stored);
    const normalized = normalizeTypes(parsed);
    return normalized.length ? normalized : defaultTypes;
  } catch {
    return defaultTypes;
  }
};

export const savePoojaTypes = (types) => {
  try {
    const normalized = normalizeTypes(types);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    return types;
  }
};

export const addOrUpdatePoojaType = (poojaType) => {
  const types = getPoojaTypes();
  const normalized = normalizeType(poojaType);
  if (!normalized.name || normalized.price <= 0) return types;
  const updated = types.filter((t) => t.name !== normalized.name);
  updated.push(normalized);
  return savePoojaTypes(updated);
};

export const removePoojaType = (name) => {
  const types = getPoojaTypes();
  const updated = types.filter((t) => t.name !== String(name).trim());
  return savePoojaTypes(updated);
};

export const clearPoojaTypes = () => {
  localStorage.removeItem(STORAGE_KEY);
};
