const Expenses = require("../models/expenseModel");
const User = require("../models/userModel");

const premiumController = {
  getLeaderboard: async (req, res) => {
    const user = req.user;
    console.log(user);
    
    if (!user.isPremium) {
      return res.status(401).json({
        success: false,
        message: "You are not a premium user",
      });
    }

    try {
      // MongoDB aggregation pipeline
      const leaderboard = await Expenses.aggregate([
        {
          $group: {
            _id: "$user", 
            expenseCount: { $sum: "$amount" }, 
          },
        },
        {
          $lookup: {
            from: "users", 
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            _id: 0,
            id: "$user._id",
            name: "$user.name",
            expenseCount: 1,
          },
        },
        { $sort: { expenseCount: -1 } }, // descending
      ]);
      
      res.status(200).json({
        success: true,
        leaderboard,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching leaderboard!",
        error: error.message,
      });
    }
  },
};

module.exports = premiumController;