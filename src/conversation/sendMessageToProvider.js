const { InlineKeyboard } = require("grammy");
const Message = require("../models/Message");
const User = require("../models/User");
const { detectContactInfo } = require("../middleware");

const sendMessageToProviderConversation = async (conversation, ctx, args) => {
    const [
        providerTelegram,
        providerName,
        providerId,
        isContentManager = false,
    ] = args.args;
    const userTelegram = ctx.from.id;

    const cancelKeyboard = new InlineKeyboard().text(
        "❌ Скасувати",
        "cancel_conversation"
    );

    const promptMessage = await ctx.reply(
        "✉️ Введіть повідомлення (текст, фото або файл) або натисніть '❌ Скасувати':",
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
            const manager = await User.findOne({ telegramId: userTelegram });
            if (!manager) throw new Error("User not found");
            console.log(`User found: ${manager.alias} (${manager._id})`);

            const msg = new Message({
                from: {
                    id: manager._id,
                    telegramId: userTelegram,
                    name: manager.alias,
                },
                to: {
                    id: providerId,
                    telegramId: providerTelegram,
                    name: providerName,
                },
                text: "",
            });

            if (update.message?.text) {
                const messageText = update.message.text.trim();

                msg.text = messageText;

                if (!isContentManager) {
                    detectContactInfo(
                        messageText,
                        manager.alias,
                        providerName
                    ).catch((err) =>
                        console.error("Contact detection error:", err)
                    );
                }

                //await ctx.api.sendMessage(providerTelegram, messageText);

                await ctx.api.editMessageText(
                    ctx.chat.id,
                    promptMessage.message_id,
                    `✅ Повідомлення для *${providerName}* надіслано!`,
                    {
                        parse_mode: "Markdown",
                    }
                );
            } else if (update.message?.photo) {
                const photoArray = update.message.photo;
                const fileId = photoArray[photoArray.length - 1].file_id;

                msg.text = "[Фото]";

                await ctx.api.sendPhoto(providerTelegram, fileId, {
                    caption: `📷 Фото від: ${manager.alias}`,
                });

                await ctx.api.editMessageText(
                    ctx.chat.id,
                    promptMessage.message_id,
                    `✅ Фото для *${providerName}* надіслано!`,
                    {
                        parse_mode: "Markdown",
                    }
                );
            } else if (update.message?.document) {
                const document = update.message.document;
                const caption = `📎 Файл від: ${manager.alias}. ${
                    update.message.caption
                        ? `Підпис: ${update.message.caption}`
                        : ``
                } `;
                const fileId = document.file_id;

                msg.text = "[Файл]";

                await ctx.api.sendDocument(providerTelegram, fileId, {
                    caption: caption,
                });

                await ctx.api.editMessageText(
                    ctx.chat.id,
                    promptMessage.message_id,
                    `✅ Файл для *${providerName}* надіслано!`,
                    {
                        parse_mode: "Markdown",
                    }
                );
            } else {
                await ctx.reply(
                    "Тип повідомлення не підтримується. Надішліть текст, фото або файл."
                );
            }

            await msg.save();
            return;
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
