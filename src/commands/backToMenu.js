const { adminKeyboard, managerKeyboard } = require("../keyboards");

module.exports = (bot) => {
  bot.callbackQuery(/^back_to_menu:(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const menuType = ctx.match[1];

    if (menuType === "admin") {
      return await ctx.callbackQuery.message?.editText("Виберіть команду:", {
        reply_markup: adminKeyboard,
      });
    }

    if (menuType === "manager") {
      return await ctx.callbackQuery.message?.editText("Виберіть команду:", {
        reply_markup: managerKeyboard,
      });
    }
  });
};
