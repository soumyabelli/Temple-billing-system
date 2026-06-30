const otpMap = new Map();

/**
 * Generate a 6-digit OTP and store it with 5-minute expiry
 * @param {string} email
 * @returns {string} otp
 */
const generateOtp = (email) => {
  const normalized = String(email || "").trim().toLowerCase();
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Ensure 6 digits
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  otpMap.set(normalized, { otp, expiresAt });
  return otp;
};

/**
 * Verify if the OTP matches and is not expired
 * @param {string} email
 * @param {string} otp
 * @returns {boolean}
 */
const verifyOtp = (email, otp) => {
  const normalized = String(email || "").trim().toLowerCase();
  const record = otpMap.get(normalized);

  if (!record) return false;

  if (Date.now() > record.expiresAt) {
    otpMap.delete(normalized);
    return false;
  }

  if (record.otp === String(otp).trim()) {
    otpMap.delete(normalized);
    return true;
  }

  return false;
};

module.exports = {
  generateOtp,
  verifyOtp,
};
