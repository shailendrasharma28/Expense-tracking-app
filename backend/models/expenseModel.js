const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db-connection");

class Expenses extends Model{};
Expenses.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    
    user_id: {
        type: DataTypes.INTEGER,
        allowNull:true,
        references: {
            model: "users",
            key: "id"
        }
    },

    expenseAmount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    category: {
        type: DataTypes.STRING,
        allowNull: false,
    },

}, {
    sequelize,
    modelName: "Expenses",
    tableName: "expenses"
});

module.exports = Expenses;