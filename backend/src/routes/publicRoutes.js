const express = require("express");
const router = express.Router();
const { getPublicAssetDetails } = require("../controllers/publicAssetController");

// GET /api/public/assets/:assetId
router.get("/assets/:assetId", getPublicAssetDetails);

module.exports = router;
