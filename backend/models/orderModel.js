const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db-connection");

class Orders extends Model{};
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
    order_id: {
        type: DataTypes.STRING,
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
    modelName: "Orders",
    tableName: "orders"
});

module.exports = Orders;