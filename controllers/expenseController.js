const Expenses = require("../models/expenseModel");

const expenseController = {
    add: async (req, res) => {
        const {expenseAmount, description, category} = req.body;
        try {
            const expense = await Expenses.create({expenseAmount, description, category});
            res.status(201).json(expense);
        } catch (error) {
            res.status(500).json({
                message: "Error add expenses!",
                error: error.message
            })
        }
    },

    get: async (req, res) => {
        try {
            const expenses = await Expenses.findAll();
            res.status(200).json(expenses);
        } catch (error) {
            res.status(500).json({
                message: "Error fetching expenses!",
                error: error.message
            })
        }
    },

    update: async (req, res) => {
        const {id} = req.params;
        const {expenseAmount, description, category} = req.body;
        try {
            const updateExpense = await Expenses.update(
                {expenseAmount, description, category}, 
                {where: {id}}
            );
            const expense = await Expenses.findByPk(id);
            res.status(200).json(expense);
        } catch (error) {
            res.status(500).json({
                message: "Error updating expenses!",
                error: error.message
            })
        }
    },

    delete: async (req, res) => {
        const {id} = req.params;
        try {
            await Expenses.destroy({where: {id}})
            res.status(200).json({
                message: "Expense deleted!"
            });
        } catch (error) {
            res.status(500).json({
                message: "Error deleting expenses!",
                error: error.message
            });
        }
    },
};

module.exports = expenseController;