const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN
const COOKIE_EXPIRES_IN = 15 * 24 * 60 * 60 * 1000; // 15 Days in milliseconds

const authMiddleware = {
  generateToken: (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  },

  setTokenCookie: (res, token) => {
    res.cookie("jwt", token, {
      expires: new Date(Date.now() + COOKIE_EXPIRES_IN),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use HTTPS in production
      sameSite: "None",
      domain: ".mediatechtemple.com", // <-- shared across subdomains
      path: "/",
    });
  },

  clearTokenCookie: (res) => {
    res.cookie("jwt", "logged_out", {
      expires: new Date(Date.now() + 1000),
      httpOnly: true,
    });
  },

  protect: async (req, res, next) => {
    try {
      let token;
      
      // Check both header and cookies for token
      if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      } else if (req.cookies?.jwt) {
        token = req.cookies.jwt;
      }

      if (!token || token === 'logged_out') {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      
      const user = await User.findById(decoded.id);
    
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  },
};

module.exports = authMiddleware;