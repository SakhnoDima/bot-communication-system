const { InlineKeyboard } = require("grammy");
const Message = require("../models/Message");
const User = require("../models/User");

const sendMessageToProviderConversation = async (conversation, ctx, args) => {
  const [providerTelegram, providerName, providerId] = args.args;
  const userTelegram = ctx.from.id;

  const cancelKeyboard = new InlineKeyboard().text(
    "❌ Скасувати",
    "cancel_conversation"
  );

  const promptMessage = await ctx.reply(
    "✉️ Введіть повідомлення для складу або натисніть '❌ Скасувати':",
    { reply_markup: cancelKeyboard }
  );

  while (true) {
    const { update } = await conversation.wait();

    if (update.callback_query?.data === "cancel_conversation") {
      await ctx.answerCallbackQuery();
      await ctx.api.editMessageText(
        ctx.chat.id,
        promptMessage.message_id,
        "⚠️ Діалог скасовано."
      );
      return;
    }

    if (update.message?.text) {
      const messageText = update.message.text.trim();

      try {
        const { _id } = await User.findOne({ telegramId: userTelegram });

        console.log("User ID:", _id);

        const msg = new Message({
          from: {
            id: _id,
            telegramId: userTelegram,
            name: ctx.from.first_name || "Unknown",
          },
          to: {
            id: providerId,
            telegramId: providerTelegram,
            name: providerName,
          },
          text: messageText,
        });

        await msg.save();

        // TODO тут відправляємо повідомлення на перевірку

        await ctx.api.sendMessage(providerTelegram, messageText);
        await ctx.api.editMessageText(
          ctx.chat.id,
          promptMessage.message_id,
          `✅ Повідомлення для *${providerName}* надіслано!`,
          {
            parse_mode: "Markdown",
          }
        );

        return;
      } catch (error) {
        console.error("Error saving message:", error);
        await ctx.reply("❗️ Сталася помилка при збереженні або надсиланні.");

        return;
      }
    }
  }
};

module.exports = sendMessageToProviderConversation;
