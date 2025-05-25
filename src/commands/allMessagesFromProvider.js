const Message = require("../models/Message");

module.exports = (bot) => {
  bot.callbackQuery(/^all_messages_from_provider:(.+)$/, async (ctx) => {
    const providerId = ctx.match[1];

    // ctx.session.selectedProviderId = provider.telegramId; // сесія selectedProviderId

    await ctx.answerCallbackQuery();
    const messagesFroDb = await Message.find({
      $or: [{ "from.telegramId": providerId }, { "to.telegramId": providerId }],
    }).sort({ createdAt: -1 });

    if (messagesFroDb.length === 0) {
      await ctx.reply("❗️ Немає повідомлень від складу.");
      return;
    }
    const messagesText = messagesFroDb
      .map((msg) => {
        return `*From:${msg.from.name}* - *To:${msg.to.name}*\n ${
          msg.text
        }\n *Date:* ${msg.date.toLocaleString()}`;
      })
      .join("\n\n");
    await ctx.reply(`📩 Повідомлення:\n\n${messagesText}`, {
      parse_mode: "Markdown",
    });
  });
};
