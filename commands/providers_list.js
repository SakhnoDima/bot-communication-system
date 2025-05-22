const { InlineKeyboard } = require("grammy");
const { roles } = require("../constants");
const { roleMiddleware } = require("../middleware");
const User = require("../models/User");

module.exports = (bot) => {
  bot.callbackQuery(
    "providers_list",
    roleMiddleware([roles.ADMIN.id, roles.MANAGER.id]),
    async (ctx) => {
      console.log(ctx.session.role);
      const providers = await User.find();

      const filteredProviders = providers.filter(
        ({ isAuth, role }) => isAuth === true && role === roles.PROVIDER.name
      );

      console.log(filteredProviders);

      if (filteredProviders.length === 0) {
        return ctx.reply(`У вас ще немає жодного складу.`);
      }

      const managerKeyboard = new InlineKeyboard();
      filteredProviders.forEach((provider) => {
        managerKeyboard.text(provider.alias, `select_provider:${provider._id}`);
        managerKeyboard.row();
      });

      await ctx.reply("Виберіть Склад:", {
        reply_markup: managerKeyboard,
      });
    }
  );
};
