const authMiddleware = require("../middlewares/authMiddleware");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

const userController = {
    signUp: async (req, res) => {
        const {name, email, password} = req.body;
        try {
            const isUserExistWithName = await User.findOne({where: {name: name}});
            if(isUserExistWithName){
                return res.status(400).json({
                    success: false,
                    message: `User already exists with name ${name}`
                })
            }
            const newUser = await User.create({name, email, password});
            res.status(200).json({
                success: true,
                message: `User created successfully with name ${name}`
            })
        } catch (error) {
            res.status(200).json({
                success: false,
                message: `Error creating user, please try again later!`
            })
        }
    },

    login: async (req, res) => {
        const {email, password} = req.body;
        try {
            const user = await User.findOne({where: {email: email}});
            if(!user){
                res.status(404).json({
                    success: false,
                    message: `User not found with given ${email}!`
                })
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if(!isPasswordValid){
                res.status(401).json({
                    success: false,
                    message: `User not authorized, Password is invalid!`,
                    userId: user.id
                })
            }
            const token = authMiddleware.generateToken(user.id);
            authMiddleware.setTokenCookie(res, token);
            const response = user.toJSON();
            delete user.password;
            res.status(200).json({
                success: true,
                message: `Hey ${user.name}! You logged in successfully.`,
                user: response,
                token: token
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: `Error login you account, try again later!`
            })
        }
    }
};

module.exports = userController;