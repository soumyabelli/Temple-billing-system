const Supplier = require("../models/Supplier");

const clean = (val) => String(val || "").trim();

exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    res.json({ success: true, suppliers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const { name, address, phone, email, gst } = req.body;
    if (!clean(name)) return res.status(400).json({ success: false, message: "Name is required" });

    const supplier = await Supplier.create({
      name: clean(name),
      address: clean(address),
      phone: clean(phone),
      email: clean(email),
      gst: clean(gst)
    });
    res.status(201).json({ success: true, supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const { name, address, phone, email, gst } = req.body;
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { name: clean(name), address: clean(address), phone: clean(phone), email: clean(email), gst: clean(gst) },
      { new: true }
    );
    if (!supplier) return res.status(404).json({ success: false, message: "Supplier not found" });
    res.json({ success: true, supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: "Supplier not found" });
    res.json({ success: true, message: "Supplier deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
