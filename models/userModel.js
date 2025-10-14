const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db-connection");

class User extends Model{};
User.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },

    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },

    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
}, {
    sequelize,
    modelName: "User",
    tableName: "users",
});

module.exports = User;