const { roles } = require("../constants");
const User = require("../models/User");

const isAuth = () => {
  return async (ctx, next) => {
    try {
      if (ctx.from.id.toString() !== roles.ADMIN.id.toString()) {
        return ctx.reply("❌ Доступ закрито.");
      }
    } catch (error) {
      log("User authentication error. Error:", error);
    }

    return next();
  };
};

module.exports = isAuth;
