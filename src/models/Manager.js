const mongoose = require("mongoose");
const User = require("./User");
const { roles } = require("../constants");

const managerSchema = new mongoose.Schema({});

module.exports = User.discriminator(roles.MANAGER.name, managerSchema);
