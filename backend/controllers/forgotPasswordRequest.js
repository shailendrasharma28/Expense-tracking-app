const sequelize = require("../config/db-connection");
const { sendNewMail } = require("../config/nodemailerConfig");
const ForgetPasswordRequest = require("../models/forgetPasswordRequests");
const User = require("../models/userModel");

const forgotPasswordReqController = {
    sendMail: async (req, res) => {
        const {email} = req.body;
        try {
            const findUser = await User.findOne({where: {email: email}});
            if (!findUser){
                return res.status(404).json({
                    success: false,
                    message: "user not found with given email!",
                })
            }
            const createReq = await ForgetPasswordRequest.create({user_id: findUser.id});
            const mail = await sendNewMail(email, createReq.id);
            res.status(200).json({
                success: true,
                message: "Mail Sent Successfully!",
                userId: findUser.id
            })
        } catch (error) {
            console.log(error);
            
            res.status(500).json({
                success: false,
                message: "Error sending mail!"
            }) 
        }
    },

    forgotPassword: async (req, res) => {
        const {new_password, token} = req.body;
        const transaction = await sequelize.transaction();
        try {
            const forgetPassReq = await ForgetPasswordRequest.findByPk(token, {transaction});
            if(!forgetPassReq) {
                return res.status(404).json({
                    success: false,
                    message: "not valid token!",
                })
            } else if (forgetPassReq.is_active === false){
                return res.status(400).json({
                    success: false,
                    message: "request expired!",
                })
            }
            console.log(forgetPassReq);
            
            const findUser = await User.findOne({where: {id: forgetPassReq.user_id}}, transaction);
            console.log(findUser);
            
            await findUser.update({password: new_password}, {transaction});
            if (!findUser){
                return res.status(404).json({
                    success: false,
                    message: "user not found!",
                })
            }
            const userId = findUser.id
            console.log("password change successfully!", findUser.password, userId );
            await forgetPassReq.update({is_active: false}, {transaction});
            await transaction.commit();
            res.status(200).json({
                success: true,
                message: "password change successfully",
                userId: findUser.id
            })
        } catch (error) {
            await transaction.rollback();
            console.log(error);
            
            res.status(500).json({
                success: false,
                message: "Error changing password!"
            }) 
        }
    },

    resetPassword: async (req, res) => {
        const token = req.params.token;
        try {
            const checkToken = await ForgetPasswordRequest.findByPk(token);
            if(!checkToken || checkToken.is_active === false){
                return res.status(400).send(`
                    <h1>Bad token or already completed request</h1>
                `)
            }
            const frontendUrl = `http://localhost:5500/frontend/pages/resetPass.html?token=${encodeURIComponent(token)}`
            res.redirect(302, frontendUrl);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error reset password!"
            })
        }
    }
};

module.exports = forgotPasswordReqController;