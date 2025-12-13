const mongoose = require("mongoose");

const ForgetPasswordRequest = new mongoose.Schema({
  _id: {
    type: String, // UUID store karne ke liye string use kar rahe hain
    default: () => require("uuid").v4(), // default UUID generate
  },

  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },

  is_active: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true }); // createdAt, updatedAt automatically add ho jaayega

module.exports = mongoose.model("ForgetPasswordRequest", ForgetPasswordRequest);