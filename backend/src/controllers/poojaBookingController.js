const PoojaBooking = require("../models/PoojaBooking");
const PoojaMaterialRequirement = require("../models/PoojaMaterialRequirement");
const InventoryItem = require("../models/InventoryItem");

// Create a new pooja booking
const createBooking = async (req, res) => {
  try {
    const { customerName, service, amount, paymentMethod, contactNumber, notes, bookingDate, templeArrangement, templeMaterialCharge } = req.body;

    if (!customerName || !service || !amount || !paymentMethod || !contactNumber || !bookingDate) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    let templeMaterialRequests = [];
    let calculatedTempleCharge = 0;

    if (templeArrangement) {
      const requirement = await PoojaMaterialRequirement.findOne({ poojaName: service }).populate("requiredMaterials.item");
      if (requirement && requirement.requiredMaterials) {
        for (const reqMat of requirement.requiredMaterials) {
          if (reqMat.templeArrangeAvailable) {
            calculatedTempleCharge += reqMat.templeCharge || 0;
            if (reqMat.item) {
              const invItem = await InventoryItem.findById(reqMat.item._id);
              if (invItem && invItem.availableStock >= reqMat.quantity) {
                const { deductStock } = require("../utils/inventoryHelper");
                await deductStock(
                  invItem._id, 
                  reqMat.quantity, 
                  "Consumed", 
                  req.user ? req.user.id : null, 
                  `Pooja Booking Consumption: ${service}`
                );
                templeMaterialRequests.push({
                  item: invItem._id,
                  itemName: invItem.name,
                  qty: `${reqMat.quantity}`
                });
              }
            }
          }
        }
      }
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
      templeArrangement: Boolean(templeArrangement),
      templeMaterialCharge: Number(templeMaterialCharge) || calculatedTempleCharge,
      templeMaterialRequests,
      materialStatus: templeArrangement ? "Consumed" : "N/A"
    });

    const savedBooking = await newBooking.save();

    const { recordTransaction } = require("../utils/accountTransactionHelper");
    await recordTransaction({
      transactionType: "Credit",
      source: "Pooja Booking",
      category: service,
      amount: savedBooking.amount,
      paymentMethod: savedBooking.paymentMethod,
      description: `Pooja Booking: ${savedBooking.bookingNumber}`,
      referenceId: savedBooking._id,
      referenceModel: "PoojaBooking",
      recordedBy: req.user.id,
      status: "Completed"
    });

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

    const { recordTransaction } = require("../utils/accountTransactionHelper");
    await recordTransaction({
      transactionType: "Debit",
      source: "Pooja Booking",
      category: "Refund Account",
      amount: booking.amount,
      paymentMethod: booking.paymentMethod,
      description: `Refund for Cancelled Pooja Booking: ${booking.bookingNumber}`,
      referenceId: booking._id,
      referenceModel: "PoojaBooking",
      recordedBy: req.user.id,
      status: "Completed"
    });

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
