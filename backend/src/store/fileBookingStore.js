const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { getEmailAliases } = require("../utils/email");

const dataDir = path.join(__dirname, "..", "data");
const bookingsFilePath = path.join(dataDir, "bookings.json");

const ensureBookingsFile = async () => {
  await fs.promises.mkdir(dataDir, { recursive: true });
  if (!fs.existsSync(bookingsFilePath)) {
    await fs.promises.writeFile(bookingsFilePath, "[]", "utf-8");
  }
};

const readBookings = async () => {
  await ensureBookingsFile();
  const raw = await fs.promises.readFile(bookingsFilePath, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const writeBookings = async (bookings) => {
  await ensureBookingsFile();
  await fs.promises.writeFile(bookingsFilePath, JSON.stringify(bookings, null, 2), "utf-8");
};

const createBooking = async (bookingData) => {
  const bookings = await readBookings();
  
  // Auto-generate bookingNumber
  let nextNum = 1001;
  if (bookings.length > 0) {
    const last = bookings[bookings.length - 1];
    if (last.bookingNumber) {
      const parsed = parseInt(last.bookingNumber.replace(/^PB/i, ""), 10);
      if (!Number.isNaN(parsed)) nextNum = parsed + 1;
    }
  }

  const booking = {
    _id: crypto.randomUUID(),
    bookingNumber: `PB${nextNum}`,
    gst: 0,
    paymentStatus: "Pending",
    transactionId: "",
    priestName: "",
    rejectionReason: "",
    bookingHistory: [],
    ...bookingData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  bookings.push(booking);
  await writeBookings(bookings);
  return booking;
};

const findBookings = async (filter = {}) => {
  let bookings = await readBookings();
  
  if (filter.devoteeEmail) {
    const email = filter.devoteeEmail;
    // Handle either direct value or $in query if buildEmailLookup is used
    if (typeof email === 'object' && email.$in) {
      bookings = bookings.filter(b => b.devoteeEmail && email.$in.includes(b.devoteeEmail.toLowerCase()));
    } else if (typeof email === 'string') {
      bookings = bookings.filter(b => b.devoteeEmail && b.devoteeEmail.toLowerCase() === email.toLowerCase());
    }
  }
  
  return bookings;
};

const findByIdAndUpdate = async (id, updates) => {
  const bookings = await readBookings();
  const idx = bookings.findIndex(b => b._id === id);
  if (idx === -1) return null;
  
  bookings[idx] = {
    ...bookings[idx],
    ...updates,
    _id: bookings[idx]._id,
    updatedAt: new Date().toISOString()
  };
  await writeBookings(bookings);
  return bookings[idx];
};

module.exports = {
  createBooking,
  findBookings,
  findByIdAndUpdate
};
