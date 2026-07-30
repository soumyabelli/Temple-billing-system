const Asset = require("../models/Asset");
const RepairTicket = require("../models/RepairTicket");

exports.getPublicAssetDetails = async (req, res) => {
  try {
    const { assetId } = req.params;

    // Find the asset by its custom assetId or _id
    let asset = await Asset.findOne({ assetId }).populate("supplier");
    
    // If not found by custom ID, try finding by MongoDB _id just in case
    if (!asset && assetId.match(/^[0-9a-fA-F]{24}$/)) {
      asset = await Asset.findById(assetId).populate("supplier");
    }

    if (!asset) {
      return res.status(404).json({ success: false, message: "Asset not found" });
    }

    // Find maintenance history (RepairTickets) for this asset
    const maintenanceHistory = await RepairTicket.find({ asset: asset._id })
      .populate("reportedBy", "name")
      .populate("approvedBy", "name")
      .sort({ createdAt: -1 });

    // Return combined public details
    res.json({
      success: true,
      asset: {
        id: asset._id,
        assetId: asset.assetId,
        name: asset.name,
        category: asset.category,
        purchaseDate: asset.purchaseDate,
        assignedLocation: asset.assignedLocation,
        status: asset.status,
        warranty: asset.warranty,
        supplier: asset.supplier ? asset.supplier.name : "N/A",
      },
      maintenanceHistory,
    });
  } catch (error) {
    console.error("Error fetching public asset details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
