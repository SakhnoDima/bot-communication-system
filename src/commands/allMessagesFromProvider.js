const Message = require("../models/Message");

module.exports = (bot) => {
  bot.callbackQuery(/^all_messages_from_provider:(.+)$/, async (ctx) => {
    const providerId = ctx.match[1];

    await ctx.answerCallbackQuery();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    console.log("startOfMonth:", startOfMonth);

    const messagesFroDb = await Message.find({
      $and: [
        {
          $or: [
            { "from.telegramId": providerId },
            { "to.telegramId": providerId },
          ],
        },
        {
          createdAt: {
            $gte: startOfMonth,
          },
        },
      ],
    }).sort({ createdAt: -1 });

    if (messagesFroDb.length === 0) {
      await ctx.reply("❗️ Немає повідомлень від складу за поточний місяць.");
      return;
    }

    const messagesText = messagesFroDb
      .map((msg) => {
        return `*From: ${msg.from.name}* - *To: ${msg.to.name}*\n${
          msg.text
        }\n*Date:* ${msg.createdAt.toLocaleString()}`;
      })
      .join("\n\n");

    await ctx.reply(`📩 Повідомлення за поточний місяць:\n\n${messagesText}`, {
      parse_mode: "Markdown",
    });
  });
};
