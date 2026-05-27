const express = require("express");

const router = express.Router();

const Task = require("../models/Task");

const {
  getTasks,
  updateTaskStatus,
} = require("../controllers/staffController");



/* GET STAFF TASKS */

router.get(
  "/tasks/:staffId",
  getTasks
);



/* UPDATE TASK STATUS */

router.put(
  "/task-status/:id",
  updateTaskStatus
);



/* ASSIGN TASK BY ADMIN OR PRIEST */

router.post(
  "/assign-task",
  async (req, res) => {

    try {
      const { staffId, staffName, duty, area, time, assignedBy } = req.body;

      if (!staffId || !staffName || !duty || !area || !time || !assignedBy) {
        return res.status(400).json({
          success: false,
          message: "staffId, staffName, duty, area, time and assignedBy are required",
        });
      }

      const task = await Task.create(
        {
          staffId,
          staffName,
          duty,
          area,
          time,
          assignedBy,
          status: "Pending",
        }
      );

      res.json({
        success: true,
        message: "Task Assigned Successfully",
        task,
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message: error.message,
      });

    }

  }
);



module.exports = router;
