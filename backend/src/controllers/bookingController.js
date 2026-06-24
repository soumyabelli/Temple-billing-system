const Booking = require("../models/Booking");

const getDashboardBookings = async (req, res) => {
  try {
    const latestBookings = await Booking.find().sort({ createdAt: -1 }).limit(10);
    
    const statsAgg = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          completed: { 
            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } 
          },
          pending: { 
            $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } 
          },
          confirmed: { 
            $sum: { $cond: [{ $eq: ["$status", "Confirmed"] }, 1, 0] } 
          },
          cancelled: { 
            $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] } 
          },
          totalRevenue: { $sum: "$amount" },
          // Approximations for todays/upcoming if datetime is a string, but if createdAt is date:
          todays: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", new Date(new Date().setHours(0,0,0,0))] },
                    { $lt: ["$createdAt", new Date(new Date().setHours(23,59,59,999))] }
                  ]
                },
                1, 0
              ]
            }
          },
          upcoming: {
            $sum: {
              $cond: [
                { $in: ["$status", ["Confirmed", "Pending"]] }, // simplification for upcoming
                1, 0
              ]
            }
          }
        }
      }
    ]);

    const stats = statsAgg[0] || {
      totalBookings: 0,
      completed: 0,
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      totalRevenue: 0,
      todays: 0,
      upcoming: 0
    };

    res.status(200).json({ latestBookings, stats });
  } catch (error) {
    console.error("getDashboardBookings error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard bookings" });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, dateRange } = req.query;
    const query = {};

    if (search) {
      const idSearchStr = search.replace(/^BK-?/i, "");
      query.$or = [
        { devoteeName: { $regex: search, $options: "i" } },
        { service: { $regex: search, $options: "i" } }
      ];
      
      if (/^[a-f0-9]{1,24}$/i.test(idSearchStr)) {
        query.$or.push({
          $expr: {
            $regexMatch: {
               input: { $toString: "$_id" },
               regex: idSearchStr,
               options: "i"
            }
          }
        });
      }
    }

    if (status) {
      query.status = status;
    }

    if (dateRange) {
      const now = new Date();
      if (dateRange === "Today") {
        const start = new Date(now.setHours(0, 0, 0, 0));
        query.createdAt = { $gte: start };
      } else if (dateRange === "Last 7 Days") {
        const start = new Date();
        start.setDate(start.getDate() - 7);
        query.createdAt = { $gte: start };
      } else if (dateRange === "This Month") {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        query.createdAt = { $gte: start };
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await Booking.countDocuments(query);

    res.status(200).json({
      bookings,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      totalRecords: total
    });

  } catch (error) {
    console.error("getAllBookings error:", error);
    res.status(500).json({ error: "Failed to fetch all bookings" });
  }
};

module.exports = {
  getDashboardBookings,
  getAllBookings
};
