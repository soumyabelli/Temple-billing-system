const AttendanceLocation = require("../models/AttendanceLocation");

exports.getLocations = async (req, res) => {
  try {
    const locations = await AttendanceLocation.find().sort({ locationName: 1 });
    res.status(200).json({ success: true, locations });
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.createLocation = async (req, res) => {
  try {
    const { locationName, latitude, longitude, allowedRadius } = req.body;
    
    if (!locationName || latitude === undefined || longitude === undefined || allowedRadius === undefined) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const newLocation = new AttendanceLocation({
      locationName,
      latitude,
      longitude,
      allowedRadius
    });

    await newLocation.save();
    res.status(201).json({ success: true, message: "Location added successfully", location: newLocation });
  } catch (error) {
    console.error("Error creating location:", error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Location name already exists" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { locationName, latitude, longitude, allowedRadius } = req.body;

    const location = await AttendanceLocation.findByIdAndUpdate(
      id,
      { locationName, latitude, longitude, allowedRadius },
      { new: true, runValidators: true }
    );

    if (!location) {
      return res.status(404).json({ success: false, message: "Location not found" });
    }

    res.status(200).json({ success: true, message: "Location updated successfully", location });
  } catch (error) {
    console.error("Error updating location:", error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Location name already exists" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await AttendanceLocation.findByIdAndDelete(id);

    if (!location) {
      return res.status(404).json({ success: false, message: "Location not found" });
    }

    res.status(200).json({ success: true, message: "Location deleted successfully" });
  } catch (error) {
    console.error("Error deleting location:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
