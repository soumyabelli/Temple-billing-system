const STORAGE_KEY = "poojaTypes";

const defaultTypes = [
  { name: "Abhisheka", price: 801 },
  { name: "Archana", price: 501 },
  { name: "Special Homa", price: 1501 },
  { name: "Satyanarayana Puja", price: 1201 },
  { name: "Maha Lakshmi Pooja", price: 2201 },
];

const normalizeTypes = (items) =>
  Array.isArray(items)
    ? items
        .map((item) => ({
          name: String(item.name || "").trim(),
          price: Number(item.price) || 0,
        }))
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
  } catch (error) {
    return defaultTypes;
  }
};

export const savePoojaTypes = (types) => {
  try {
    const normalized = normalizeTypes(types);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch (error) {
    return types;
  }
};

export const addOrUpdatePoojaType = (poojaType) => {
  const types = getPoojaTypes();
  const normalized = normalizeTypes([poojaType])[0];
  if (!normalized) return types;

  const updated = types.filter((type) => type.name !== normalized.name);
  updated.push(normalized);
  return savePoojaTypes(updated);
};

export const removePoojaType = (name) => {
  const types = getPoojaTypes();
  const updated = types.filter((type) => type.name !== String(name).trim());
  return savePoojaTypes(updated);
};

export const clearPoojaTypes = () => {
  localStorage.removeItem(STORAGE_KEY);
};
