const mongoose = require("mongoose");

const Payment = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  order_id: {
    type: String,
    required: true,
  },
  payment_status: {
    type: String,
    required: true,
    default: "initiated",
  },
  payment_session_id: {
    type: String,
    required: false,
  },
  payment_id: {
    type: String,
    required: false,
  },
  order_amount: {
    type: String, 
    required: false,
  },
}, { timestamps: true }); 

module.exports = mongoose.model("Payment", Payment);
