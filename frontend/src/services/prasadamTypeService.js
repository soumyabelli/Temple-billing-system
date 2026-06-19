const STORAGE_KEY = "prasadamTypes";

export const defaultPrasadamTypes = [
  { name: "Laddu Prasadam", price: 151 },
  { name: "Panchamrit Prasadam", price: 101 },
  { name: "Pulihora Prasadam", price: 121 },
  { name: "Sweet Pongal Prasadam", price: 131 },
  { name: "Curd Rice Prasadam", price: 111 },
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

export const getPrasadamTypes = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultPrasadamTypes;
    const parsed = JSON.parse(stored);
    const normalized = normalizeTypes(parsed);
    return normalized.length ? normalized : defaultPrasadamTypes;
  } catch (error) {
    return defaultPrasadamTypes;
  }
};

export const savePrasadamTypes = (types) => {
  try {
    const normalized = normalizeTypes(types);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch (error) {
    return types;
  }
};

export const addOrUpdatePrasadamType = (prasadamType) => {
  const types = getPrasadamTypes();
  const normalized = normalizeTypes([prasadamType])[0];
  if (!normalized) return types;

  const updated = types.filter((type) => type.name !== normalized.name);
  updated.push(normalized);
  return savePrasadamTypes(updated);
};

export const removePrasadamType = (name) => {
  const types = getPrasadamTypes();
  const updated = types.filter((type) => type.name !== String(name).trim());
  return savePrasadamTypes(updated);
};

export const clearPrasadamTypes = () => {
  localStorage.removeItem(STORAGE_KEY);
};
