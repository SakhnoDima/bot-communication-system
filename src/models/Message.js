const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  from: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    telegramId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  to: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    telegramId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = mongoose.model("Messages", messageSchema);
