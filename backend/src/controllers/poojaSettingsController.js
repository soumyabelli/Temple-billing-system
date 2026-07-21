const PoojaMaterialRequirement = require("../models/PoojaMaterialRequirement");

exports.getAllRequirements = async (req, res) => {
  try {
    const reqs = await PoojaMaterialRequirement.find().populate("requiredMaterials.item", "name unit category");
    res.json({ success: true, requirements: reqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRequirementByName = async (req, res) => {
  try {
    const poojaName = req.params.poojaName;
    const reqs = await PoojaMaterialRequirement.findOne({ poojaName }).populate("requiredMaterials.item", "name unit category");
    res.json({ success: true, requirement: reqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.saveRequirement = async (req, res) => {
  try {
    const { poojaName, requiredMaterials } = req.body;
    if (!poojaName) return res.status(400).json({ success: false, message: "Pooja Name is required" });

    const reqs = await PoojaMaterialRequirement.findOneAndUpdate(
      { poojaName: poojaName.trim() },
      { requiredMaterials: requiredMaterials || [] },
      { new: true, upsert: true }
    ).populate("requiredMaterials.item", "name unit category");

    res.json({ success: true, requirement: reqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
