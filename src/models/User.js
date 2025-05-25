const mongoose = require("mongoose");
const { roles } = require("../constants");

const baseOptions = {
  discriminatorKey: "role",
  collection: "users",
};

const userSchema = new mongoose.Schema(
  {
    telegramId: { type: String },
    name: String,
    alias: {
      type: String,
      required: true,
      unique: true,
    },
    isAuth: { type: Boolean, default: false },
    inviteCode: { type: String },
  },
  baseOptions
);

module.exports = mongoose.model("Users", userSchema);
