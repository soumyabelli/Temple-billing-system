const STORAGE_KEY = "donationTypes";

const defaultTypes = [
  "Annadanam",
  "Temple Fund",
  "Festival Donation",
  "Special Donation",
  "Sponsorship",
  "General",
  "Pooja",
];

export const getDonationTypes = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultTypes;
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return defaultTypes;
  } catch (error) {
    return defaultTypes;
  }
};

export const saveDonationTypes = (types) => {
  try {
    const normalized = Array.from(new Set(types.map((type) => String(type).trim()))).filter(Boolean);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch (error) {
    return types;
  }
};

export const addDonationType = (type) => {
  const newType = String(type).trim();
  if (!newType) return getDonationTypes();

  const types = getDonationTypes();
  if (types.includes(newType)) return types;

  const updated = [...types, newType];
  saveDonationTypes(updated);
  return updated;
};

export const clearDonationTypes = () => {
  localStorage.removeItem(STORAGE_KEY);
};
