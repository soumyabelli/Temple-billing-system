const express = require("express");
const router = express.Router();
const {
  getAllPrasadam,
  createPrasadam,
  updatePrasadam,
  restockPrasadam,
  deletePrasadam,
  getSalesReports,
} = require("../controllers/prasadamController");

router.get("/", getAllPrasadam);
router.post("/", createPrasadam);
router.put("/:id", updatePrasadam);
router.put("/:id/restock", restockPrasadam);
router.delete("/:id", deletePrasadam);
router.get("/reports/sales", getSalesReports);

module.exports = router;
