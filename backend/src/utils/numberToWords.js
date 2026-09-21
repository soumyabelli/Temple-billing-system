/**
 * Converts numbers into Indian English Words for Currency Receipts
 * e.g. 1012 -> "One Thousand Twelve Rupees Only"
 */

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
];

const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
];

function convertBelowThousand(n) {
  let str = "";
  if (n >= 100) {
    str += ONES[Math.floor(n / 100)] + " Hundred ";
    n %= 100;
  }
  if (n >= 20) {
    str += TENS[Math.floor(n / 10)] + " ";
    n %= 10;
  }
  if (n > 0) {
    str += ONES[n] + " ";
  }
  return str.trim();
}

function numberToWordsINR(amount) {
  const num = Number(amount);
  if (isNaN(num) || num <= 0) return "Zero Rupees Only";

  const whole = Math.floor(num);
  const paise = Math.round((num - whole) * 100);

  let remaining = whole;
  const parts = [];

  // Crores (>= 1,00,00,000)
  if (remaining >= 10000000) {
    const crores = Math.floor(remaining / 10000000);
    parts.push(convertBelowThousand(crores) + " Crore");
    remaining %= 10000000;
  }

  // Lakhs (>= 1,00,000)
  if (remaining >= 100000) {
    const lakhs = Math.floor(remaining / 100000);
    parts.push(convertBelowThousand(lakhs) + " Lakh");
    remaining %= 100000;
  }

  // Thousands (>= 1,000)
  if (remaining >= 1000) {
    const thousands = Math.floor(remaining / 1000);
    parts.push(convertBelowThousand(thousands) + " Thousand");
    remaining %= 1000;
  }

  // Hundreds & below (< 1,000)
  if (remaining > 0) {
    parts.push(convertBelowThousand(remaining));
  }

  let words = parts.join(" ").trim();
  if (!words) words = "Zero";
  words += " Rupees";

  if (paise > 0) {
    words += " and " + convertBelowThousand(paise) + " Paise";
  }

  words += " Only";
  return words;
}

module.exports = {
  numberToWordsINR,
};
