const express = require("express");
const forgotPasswordReqController = require("../controllers/forgotPasswordRequest");
const router = express.Router();

router.post("/send-mail", forgotPasswordReqController.sendMail);
router.post("/forgotpassword", forgotPasswordReqController.forgotPassword);
router.get("/resetpassword/:token", forgotPasswordReqController.resetPassword);

module.exports = router;