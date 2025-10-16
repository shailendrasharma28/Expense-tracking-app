const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db-connection");
const bcrypt = require("bcryptjs")

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
    is_premium: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: "User",
    tableName: "users",
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    }
});

module.exports = User;