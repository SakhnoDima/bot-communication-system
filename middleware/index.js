const roleMiddleware = (requiredRoleId) => {
  return async (ctx, next) => {
    if (!requiredRoleId.includes(ctx.from.id)) {
      return ctx.reply("❌ Доступ запрещен.");
    }
    return next();
  };
};

module.exports = {
  roleMiddleware,
};
