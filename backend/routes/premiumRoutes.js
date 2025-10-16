const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const premiumController = require("../controllers/premiumController");
const router = express.Router();

router.get("/leaderboard", authMiddleware.protect, premiumController.getLeaderboard);

module.exports = router;