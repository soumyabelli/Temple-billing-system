const mongoose = require("mongoose");

const poojaBookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["UPI", "Cash", "Card"],
    },
    contactNumber: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      default: "Booked",
      enum: ["Booked", "Completed", "Cancelled"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate hook to generate bookingNumber
poojaBookingSchema.pre("validate", async function (next) {
  if (!this.bookingNumber) {
    try {
      const lastBooking = await this.constructor.findOne({}, {}, { sort: { createdAt: -1 } });
      let nextNumber = 1001;
      
      if (lastBooking && lastBooking.bookingNumber) {
        const lastNumberStr = lastBooking.bookingNumber.replace("PB", "");
        const lastNumber = parseInt(lastNumberStr, 10);
        if (!isNaN(lastNumber)) {
          nextNumber = lastNumber + 1;
        }
      }
      this.bookingNumber = `PB${nextNumber}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model("PoojaBooking", poojaBookingSchema);
