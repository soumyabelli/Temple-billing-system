const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const dataDir = path.join(__dirname, "..", "data");
const donationsFilePath = path.join(dataDir, "donations.json");

const ensureDonationsFile = async () => {
  await fs.promises.mkdir(dataDir, { recursive: true });
  if (!fs.existsSync(donationsFilePath)) {
    await fs.promises.writeFile(donationsFilePath, "[]", "utf-8");
  }
};

const readDonations = async () => {
  await ensureDonationsFile();
  const raw = await fs.promises.readFile(donationsFilePath, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const writeDonations = async (donations) => {
  await ensureDonationsFile();
  await fs.promises.writeFile(donationsFilePath, JSON.stringify(donations, null, 2), "utf-8");
};

const createDonation = async (donationData) => {
  const donations = await readDonations();

  // Auto-generate receiptNumber
  let nextNum = 1001;
  if (donations.length > 0) {
    const last = donations[donations.length - 1];
    if (last.receiptNumber) {
      const parsed = parseInt(last.receiptNumber.replace(/^REC/i, ""), 10);
      if (!Number.isNaN(parsed)) nextNum = parsed + 1;
    }
  }

  const donation = {
    _id: crypto.randomUUID(),
    receiptNumber: `REC${nextNum}`,
    transactionId: donationData.transactionId || "",
    ...donationData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  donations.push(donation);
  await writeDonations(donations);
  return donation;
};

const findDonations = async (filter = {}) => {
  let donations = await readDonations();

  if (filter.donorEmail) {
    const email = filter.donorEmail;
    if (typeof email === 'object' && email.$in) {
      donations = donations.filter(d => d.donorEmail && email.$in.includes(d.donorEmail.toLowerCase()));
    } else if (typeof email === 'string') {
      donations = donations.filter(d => d.donorEmail && d.donorEmail.toLowerCase() === email.toLowerCase());
    }
  }

  return donations;
};

module.exports = {
  createDonation,
  findDonations,
};
