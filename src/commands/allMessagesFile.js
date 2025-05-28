const Message = require("../models/Message");
const { InputFile } = require("grammy");

module.exports = (bot) => {
  bot.callbackQuery(/^all_messages_from_provider_file:(.+)$/, async (ctx) => {
    const providerId = ctx.match[1];

    await ctx.answerCallbackQuery();

    const messagesFroDb = await Message.find({
      $and: [
        {
          $or: [
            { "from.telegramId": providerId },
            { "to.telegramId": providerId },
          ],
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

    const buffer = Buffer.from(messagesText, "utf8");

    await ctx.replyWithDocument(
      new InputFile(
        buffer,
        `Повідомлення від:${messagesFroDb[0].from.name}.txt`
      )
    );
  });
};
