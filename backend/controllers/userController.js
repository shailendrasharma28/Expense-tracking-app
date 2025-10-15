const User = require("../models/userModel");

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
    }
};

module.exports = userController;