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
    templeArrangement: { type: Boolean, default: false },
    templeMaterialCharge: { type: Number, default: 0 },
    templeMaterialRequests: [
      {
        item: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryItem" },
        itemName: String,
        qty: String, // E.g. '2 Kg'
      }
    ],
    materialStatus: {
      type: String,
      enum: ["N/A", "Pending", "Approved", "Reserved", "Ready", "Issued", "Consumed", "Cancelled"],
      default: "N/A",
    },
    priestChecklist: {
      devoteeArrived: { type: Boolean, default: false },
      templeMaterialsReceived: { type: Boolean, default: false },
      devoteeMaterialsChecked: { type: Boolean, default: false },
      poojaStarted: { type: Boolean, default: false },
      poojaCompleted: { type: Boolean, default: false },
      inventoryConsumed: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate hook to generate bookingNumber
poojaBookingSchema.pre("validate", async function () {
  if (this.bookingNumber) return;

  const lastBooking = await this.constructor.findOne({}, {}, { sort: { createdAt: -1 } });
  let nextNumber = 1001;

  if (lastBooking?.bookingNumber) {
    const lastNumber = parseInt(lastBooking.bookingNumber.replace("PB", ""), 10);
    if (!Number.isNaN(lastNumber)) nextNumber = lastNumber + 1;
  }
  this.bookingNumber = `PB${nextNumber}`;
});

module.exports = mongoose.model("PoojaBooking", poojaBookingSchema);
