const express = require("express");
const expenseController = require("../controllers/expenseController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware.protect, expenseController.add);
router.get("/", authMiddleware.protect, expenseController.get);
router.put("/:id", authMiddleware.protect, expenseController.update);
router.delete("/:id", authMiddleware.protect, expenseController.delete);

module.exports = router;