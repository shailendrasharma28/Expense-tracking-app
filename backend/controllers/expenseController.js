const Expense = require("../models/expenseModel");
const User = require("../models/userModel");

const expenseController = {

  add: async (req, res) => {
    const { expenseAmount, description, category } = req.body;
    const userId = req.user.id; 

    try {
      const expense = await Expense.create({
        user: userId,
        amount: expenseAmount,
        description,
        category
      });

      await User.findByIdAndUpdate(
        userId,
        { $inc: { totalExpense: expenseAmount } },
        { new: true }
      );

      res.status(201).json({
        success: true,
        expense
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error adding expense"
      });
    }
  },

  get: async (req, res) => {
    const userId = req.user.id;
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    try {
      const [expenses, count] = await Promise.all([
        Expense.find({ user: userId })
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),

        Expense.countDocuments({ user: userId })
      ]);

      res.status(200).json({
        rows: expenses,
        count,
        currentPage: page,
        totalPages: Math.ceil(count / limit)
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error fetching expenses"
      });
    }
  },

  update: async (req, res) => {
    const { id } = req.params;
    const { amount, description, category } = req.body;
    const userId = req.user.id;

    try {
      const expense = await Expense.findOneAndUpdate(
        { _id: id, user: userId },
        { amount, description, category },
        { new: true }
      );

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: "Expense not found"
        });
      }

      res.status(200).json({
        success: true,
        expense
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error updating expense"
      });
    }
  },

  delete: async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    
    try {
      const expense = await Expense.findOneAndDelete({
        _id: id,
        user: userId
      });

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: "Expense not found"
        });
      }

      await User.findByIdAndUpdate(
        userId,
        { $inc: { totalExpense: -expense.amount } }
      );

      res.status(200).json({
        success: true,
        message: "Expense deleted"
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error deleting expense"
      });
    }
  }
};

module.exports = expenseController;