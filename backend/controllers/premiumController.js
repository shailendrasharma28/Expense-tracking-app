const { fn, col } = require("sequelize");
const Expenses = require("../models/expenseModel");
const User = require("../models/userModel");

const premiumController = {
    getLeaderboard: async (req, res) => {
        const user = req.user;
        if(user.is_premium === false){
            return res.status(401).json({
                success: false,
                message: "You are not a premium user"
            })
        }
        try {
            const leaderboard = await Expenses.findAll({
              attributes: ["id", "user_id", [fn("SUM", col("expenseAmount")), "expenseCount"], [col("name"), "username"]],
              include: {model: User, attributes: []},
              group: ["user_id"],
              order: [["expenseCount", "DESC"]]
            });
            res.status(200).json({
                success: true,
                leaderboard: leaderboard
            })
        } catch (error) {
            res.status(200).json({
                success: false,
                message: "error fetching leaderboard!",
                error: error.message
            })
        }
    }
};

module.exports = premiumController;