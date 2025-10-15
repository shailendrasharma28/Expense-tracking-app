const express = require("express");
const expenseController = require("../controllers/expenseController");
const router = express.Router();

router.post("/", expenseController.add);
router.get("/", expenseController.get);
router.put("/:id", expenseController.update);
router.delete("/:id", expenseController.delete);

module.exports = router;