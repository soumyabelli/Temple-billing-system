const PoojaBooking = require("../models/PoojaBooking");

// Create a new pooja booking
const createBooking = async (req, res) => {
  try {
    const { customerName, service, amount, paymentMethod, contactNumber, notes, bookingDate } = req.body;

    if (!customerName || !service || !amount || !paymentMethod || !contactNumber || !bookingDate) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const newBooking = new PoojaBooking({
      customerName,
      service,
      amount,
      paymentMethod,
      contactNumber,
      notes,
      bookingDate,
      createdBy: req.user.id, // from auth middleware
    });

    const savedBooking = await newBooking.save();
    res.status(201).json({ message: "Pooja booked successfully", booking: savedBooking });
  } catch (error) {
    console.error("Error creating pooja booking:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get bookings for the logged-in user
const getMyBookings = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    
    let query = { createdBy: req.user.id };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { service: { $regex: search, $options: "i" } },
        { bookingNumber: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const bookings = await PoojaBooking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PoojaBooking.countDocuments(query);

    res.status(200).json({
      bookings,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      totalBookings: total,
    });
  } catch (error) {
    console.error("Error fetching my bookings:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Cancel a booking (updates status to 'Cancelled')
const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await PoojaBooking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Optional: Only allow the creator or an admin to cancel
    if (booking.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }

    booking.status = "Cancelled";
    await booking.save();

    res.status(200).json({ message: "Booking cancelled successfully", booking });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
};
