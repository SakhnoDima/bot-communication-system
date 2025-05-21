const roleMiddleware = (requiredRole) => {
  return async (ctx, next) => {
    console.log(requiredRole);
    console.log(ctx.from.id);
    if (requiredRole !== ctx.from.id) {
      return ctx.reply("❌ Доступ запрещен.");
    }
    return next();
  };
};

module.exports = {
  roleMiddleware,
};
