const { InlineKeyboard } = require("grammy");
const Message = require("../models/Message");
const User = require("../models/User");
const { detectContactInfo } = require("../middleware");

const sendMessageToProviderConversation = async (conversation, ctx, args) => {
    const [providerTelegram, providerName, providerId] = args.args;
    const userTelegram = ctx.from.id;

    const cancelKeyboard = new InlineKeyboard().text(
        "❌ Скасувати",
        "cancel_conversation"
    );

    const promptMessage = await ctx.reply(
        "✉️ Введіть повідомлення для складу (текст, фото або файл) або натисніть '❌ Скасувати':",
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

        try {
            const user = await User.findOne({ telegramId: userTelegram });
            if (!user) throw new Error("User not found");

            if (update.message?.text) {
                const messageText = update.message.text.trim();

                const msg = new Message({
                    from: {
                        id: user._id,
                        telegramId: userTelegram,
                        name: user.alias,
                    },
                    to: {
                        id: providerId,
                        telegramId: providerTelegram,
                        name: providerName,
                    },
                    text: messageText,
                });

                await msg.save();

                detectContactInfo(messageText, user.alias, providerName).catch(
                    (err) => console.error("Contact detection error:", err)
                );

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
            } else if (update.message?.photo) {
                const photoArray = update.message.photo;
                const fileId = photoArray[photoArray.length - 1].file_id;

                const msg = new Message({
                    from: {
                        id: user._id,
                        telegramId: userTelegram,
                        name: user.alias,
                    },
                    to: {
                        id: providerId,
                        telegramId: providerTelegram,
                        name: providerName,
                    },
                    text: "[Фото]",
                });

                await msg.save();

                await ctx.api.sendPhoto(providerTelegram, fileId, {
                    caption: `📷 Фото від: ${user.alias}`,
                });

                await ctx.api.editMessageText(
                    ctx.chat.id,
                    promptMessage.message_id,
                    `✅ Фото для *${providerName}* надіслано!`,
                    {
                        parse_mode: "Markdown",
                    }
                );

                return;
            } else if (update.message?.document) {
                const document = update.message.document;
                const fileId = document.file_id;

                const msg = new Message({
                    from: {
                        id: user._id,
                        telegramId: userTelegram,
                        name: user.alias,
                    },
                    to: {
                        id: providerId,
                        telegramId: providerTelegram,
                        name: providerName,
                    },
                    text: "[Файл]",
                });

                await msg.save();

                await ctx.api.sendDocument(providerTelegram, fileId, {
                    caption: `📎 Файл від: ${user.alias}`,
                });

                await ctx.api.editMessageText(
                    ctx.chat.id,
                    promptMessage.message_id,
                    `✅ Файл для *${providerName}* надіслано!`,
                    {
                        parse_mode: "Markdown",
                    }
                );

                return;
            } else {
                await ctx.reply(
                    "Тип повідомлення не підтримується. Надішліть текст, фото або файл."
                );
            }
        } catch (error) {
            console.error("Error processing message:", error);
            await ctx.reply(
                "❗️ Сталася помилка при обробці повідомлення. Спробуйте ще раз."
            );
            return;
        }
    }
};

module.exports = sendMessageToProviderConversation;
