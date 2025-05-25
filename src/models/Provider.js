const mongoose = require("mongoose");
const User = require("./User");
const { roles } = require("../constants");

const providerSchema = new mongoose.Schema({
  manager: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: String,
    telegramId: { type: String, required: true },
  },
});

module.exports = User.discriminator(roles.PROVIDER.name, providerSchema);
