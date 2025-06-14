const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const { roles } = require("./constants");

const initBdAndAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ MongoDB connected!");

        const existing = await User.findOne({ alias: roles.ADMIN.name });
        if (!existing) {
            const newUser = new User({
                telegramId: process.env.ADMIN_ID,
                alias: roles.ADMIN.name,
                isAuth: true,
            });

            await newUser.save();
            console.log("✅ Admin user added to DB");
        } else {
            console.log("Admin already exists in DB");
        }
    } catch (error) {
        console.error("Error connecting to MongoDB or adding admin:", error);
    }
};

module.exports = { initBdAndAdmin };
