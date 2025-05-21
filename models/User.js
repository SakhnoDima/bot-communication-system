const mongoose = require("mongoose");
const { roles } = require("../constants");

const userSchema = new mongoose.Schema({
  telegramId: { type: String },
  name: String,
  role: {
    type: String,
    enum: [roles.PROVIDER.name],
    required: true,
  },
  alias: {
    type: String,
    required: true,
  },
  isAuth: Boolean,
  inviteCode: String,
});

module.exports = mongoose.model("Providers", userSchema);
