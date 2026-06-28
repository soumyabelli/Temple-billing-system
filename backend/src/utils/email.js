const LEGACY_DOMAIN = "@temple.local";
const CANONICAL_DOMAIN = "@gmail.com";

const normalizeEmail = (email) => {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return "";

  if (normalized.endsWith(LEGACY_DOMAIN)) {
    return `${normalized.slice(0, -LEGACY_DOMAIN.length)}${CANONICAL_DOMAIN}`;
  }

  return normalized;
};

const getEmailAliases = (email) => {
  const normalized = normalizeEmail(email);
  if (!normalized) return [];

  if (normalized.endsWith(CANONICAL_DOMAIN)) {
    const localPart = normalized.slice(0, -CANONICAL_DOMAIN.length);
    return [normalized, `${localPart}${LEGACY_DOMAIN}`];
  }

  return [normalized];
};

const buildEmailLookup = (field, email) => {
  const aliases = getEmailAliases(email);
  if (!aliases.length) return null;
  if (aliases.length === 1) return { [field]: aliases[0] };
  return { [field]: { $in: aliases } };
};

module.exports = {
  normalizeEmail,
  getEmailAliases,
  buildEmailLookup,
};
