const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const paymentController = require("../controllers/paymentController");
const router = express.Router();

router.post("/create", authMiddleware.protect, paymentController.createPayment);
router.get("/order/:order_id", paymentController.confirmOrder);

module.exports = router;