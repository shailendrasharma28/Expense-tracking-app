const { sendNewMail } = require("../config/nodemailerConfig");
const forgetPasswordRequests = require("../models/forgetPasswordRequests");
const User = require("../models/userModel"); 

const forgotPasswordReqController = {
  sendMail: async (req, res) => {
    const { email } = req.body;
    try {
      const findUser = await User.findOne({ email });
      if (!findUser) {
        return res.status(404).json({
          success: false,
          message: "User not found with given email!",
        });
      }

      const createReq = await forgetPasswordRequests.create({ user_id: findUser._id });
      await sendNewMail(email, createReq._id);

      res.status(200).json({
        success: true,
        message: "Mail Sent Successfully!",
        userId: findUser._id,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error sending mail!",
      });
    }
  },

  forgotPassword: async (req, res) => {
    const { new_password, token } = req.body;
    try {
      const forgetPassReq = await forgetPasswordRequests.findById(token);

      if (!forgetPassReq) {
        return res.status(404).json({
          success: false,
          message: "Not valid token!",
        });
      }

      if (forgetPassReq.is_active === false) {
        return res.status(400).json({
          success: false,
          message: "Request expired!",
        });
      }

      const findUser = await User.findById(forgetPassReq.user_id);
      if (!findUser) {
        return res.status(404).json({
          success: false,
          message: "User not found!",
        });
      }

      findUser.password = new_password; // assume pre-save hook hashes password
      await findUser.save();

      forgetPassReq.is_active = false;
      await forgetPassReq.save();

      console.log("Password changed successfully!", findUser.password, findUser._id);

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
        userId: findUser._id,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error changing password!",
      });
    }
  },

  resetPassword: async (req, res) => {
    const token = req.params.token;
    try {
      const checkToken = await forgetPasswordRequests.findById(token);
      if (!checkToken || checkToken.is_active === false) {
        return res.status(400).send(`
          <h1>Bad token or already completed request</h1>
        `);
      }

      const frontendUrl = `http://localhost:4000/reset-password?token=${encodeURIComponent(token)}`;
      res.redirect(302, frontendUrl);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error resetting password!",
      });
    }
  },
};

module.exports = forgotPasswordReqController;