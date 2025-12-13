const authMiddleware = require("../middlewares/authMiddleware");
const User = require("../models/userModel");

const userController = {
  // ================= SIGN UP =================
  signUp: async (req, res) => {
    const { name, email, password } = req.body;

    try {
      const existingUser = await User.findOne({
        $or: [{ email }, { name }]
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists"
        });
      }

      const newUser = new User({ name, email, password });
      await newUser.save(); // password hash yahin hoga

      res.status(201).json({
        success: true,
        message: `User created successfully with name ${name}`
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error creating user"
      });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid password"
        });
      }

      const token = authMiddleware.generateToken(user._id);
      authMiddleware.setTokenCookie(res, token);

      const response = user.toObject();
      delete response.password;

      res.status(200).json({
        success: true,
        message: `Hey ${user.name}! You logged in successfully.`,
        user: response,
        token
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Login failed"
      });
    }
  },

  getUserById: async (req, res) => {
    const { id } = req.user; 
    try {
      const user = await User.findById(id).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      res.status(200).json({
        success: true,
        user
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error fetching user"
      });
    }
  }
};

module.exports = userController;