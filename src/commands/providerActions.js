const { InlineKeyboard } = require("grammy");

const { roles } = require("../constants");

module.exports = (bot) => {
  bot.callbackQuery(/^provider_actions:(.+)$/, async (ctx) => {
    const provider = ctx.match[1];

    const role = ctx.session.role;
    const actionProviderKeyboard = new InlineKeyboard();
    actionProviderKeyboard
      .text("Відправити повідомлення", `message_to_provider:${provider}`)
      .row()
      .text(
        "Всі повідомлення",
        `all_messages_from_provider:${provider.split("/")[0]}`
      )
      .row()
      .text(
        "<< Назад в меню",
        role === roles.ADMIN.name
          ? `back_to_menu:admin`
          : `back_to_menu:manager`
      );

    await ctx.callbackQuery.message?.editText("Виберіть дію:", {
      reply_markup: actionProviderKeyboard,
    });
  });
};
