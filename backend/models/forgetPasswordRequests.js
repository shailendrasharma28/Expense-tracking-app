const { Model, DataTypes, UUID } = require("sequelize");
const sequelize = require("../config/db-connection");

class ForgetPasswordRequest extends Model{};
ForgetPasswordRequest.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    
    user_id: {
        type: DataTypes.INTEGER,
        allowNull:true,
        references: {
            model: "users",
            key: "id"
        }
    },

    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }

}, {
    sequelize,
    modelName: "ForgetPasswordRequest",
    tableName: "forget_password_requests"
});

module.exports = ForgetPasswordRequest;