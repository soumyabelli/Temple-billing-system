const Pooja = require("../models/Pooja");

exports.getAllPoojas = async (req, res) => {
  try {
    const poojas = await Pooja.find({}).populate("requiredMaterials.item", "name category currentStock");
    res.status(200).json(poojas);
  } catch (err) {
    console.error("Error fetching poojas:", err);
    res.status(500).json({ message: "Failed to fetch poojas" });
  }
};

exports.getPoojaById = async (req, res) => {
  try {
    const pooja = await Pooja.findById(req.params.id).populate("requiredMaterials.item", "name category currentStock");
    if (!pooja) {
      return res.status(404).json({ message: "Pooja not found" });
    }
    res.status(200).json(pooja);
  } catch (err) {
    console.error("Error fetching pooja:", err);
    res.status(500).json({ message: "Failed to fetch pooja" });
  }
};

exports.createPooja = async (req, res) => {
  try {
    const pooja = new Pooja(req.body);
    await pooja.save();
    res.status(201).json({ message: "Pooja created successfully", pooja });
  } catch (err) {
    console.error("Error creating pooja:", err);
    res.status(400).json({ message: "Failed to create pooja", error: err.message });
  }
};

exports.updatePooja = async (req, res) => {
  try {
    const pooja = await Pooja.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!pooja) {
      return res.status(404).json({ message: "Pooja not found" });
    }
    res.status(200).json({ message: "Pooja updated successfully", pooja });
  } catch (err) {
    console.error("Error updating pooja:", err);
    res.status(400).json({ message: "Failed to update pooja", error: err.message });
  }
};

exports.deletePooja = async (req, res) => {
  try {
    const pooja = await Pooja.findByIdAndDelete(req.params.id);
    if (!pooja) {
      return res.status(404).json({ message: "Pooja not found" });
    }
    res.status(200).json({ message: "Pooja deleted successfully" });
  } catch (err) {
    console.error("Error deleting pooja:", err);
    res.status(500).json({ message: "Failed to delete pooja" });
  }
};
