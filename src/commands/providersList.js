const { InlineKeyboard } = require("grammy");
const { roles } = require("../constants");

const User = require("../models/User");

module.exports = (bot) => {
  bot.callbackQuery("providers_list", async (ctx) => {
    const providers = await User.find();

    const filteredProviders = providers.filter(
      ({ isAuth, role }) => isAuth === true && role === roles.PROVIDER.name
    );

    if (filteredProviders.length === 0) {
      return ctx.reply(`У вас ще немає жодного складу.`);
    }
    const managerKeyboard = new InlineKeyboard();

    filteredProviders.forEach((provider) => {
      managerKeyboard.text(
        provider.alias,
        `provider_actions:${provider.telegramId}/${provider._id}`
      );
      managerKeyboard.row();
    });

    const role = ctx.session.role;

    role === roles.ADMIN.name
      ? managerKeyboard.text("<< Назад в меню", `back_to_menu:admin`)
      : managerKeyboard.text("<< Назад в меню", `back_to_menu:manager`);

    await ctx.callbackQuery.message?.editText("Виберіть Склад:", {
      reply_markup: managerKeyboard,
    });
  });
};
