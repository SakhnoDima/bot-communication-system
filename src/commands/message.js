const { roles } = require("../constants");
const { detectContactInfo } = require("../middleware");
const Message = require("../models/Message");
const User = require("../models/User");

module.exports = (bot) => {
    bot.on("message", async (ctx) => {
        if (!ctx.session || !ctx.session.role) {
            await ctx.reply(
                "Ваша роль не визначена.\nСкористайтесь командой /start для перезапуску бота. "
            );
            return;
        }
        if (ctx.session.role === roles.MANAGER.name) {
            await ctx.reply(
                `Для відправки повідомлень виберіть склад зі списку.`
            );
            return;
        }

        if (ctx.session.role === roles.PROVIDER.name) {
            const myId = ctx.update.message.from.id;

            const myMessage = ctx.update.message.text;
            try {
                const myAccount = await User.findOne({
                    telegramId: myId,
                });

                if (ctx.message.text) {
                    const myMessage = ctx.message.text;

                    const msg = new Message({
                        from: {
                            telegramId: myAccount.telegramId,
                            id: myAccount._id,
                            name: myAccount.alias,
                        },
                        to: {
                            telegramId: myAccount.manager.telegramId,
                            id: myAccount.manager.id,
                            name: myAccount.manager.name,
                        },
                        text: myMessage,
                    });
                    await msg.save();

                    await bot.api.sendMessage(
                        myAccount.manager.telegramId,
                        `✉️ Повідомлення від: ${myAccount.alias}\n\n${myMessage}`
                    );

                    detectContactInfo(
                        myMessage,
                        myAccount.alias,
                        myAccount.manager.name
                    );
                } else if (ctx.message.photo) {
                    const photoArray = ctx.message.photo;
                    const fileId = photoArray[photoArray.length - 1].file_id;

                    await bot.api.sendPhoto(
                        myAccount.manager.telegramId,
                        fileId,
                        {
                            caption: `📷 Фото від: ${myAccount.alias}`,
                        }
                    );
                } else if (ctx.message.document) {
                    const document = ctx.message.document;
                    const fileId = document.file_id;

                    await bot.api.sendDocument(
                        myAccount.manager.telegramId,
                        fileId,
                        {
                            caption: `📎 Файл від: ${myAccount.alias}`,
                        }
                    );
                } else {
                    await ctx.reply("Тип повідомлення не підтримується.");
                }
            } catch (error) {
                console.log("Error saving message:", error);
                await ctx.reply(
                    "❗️ Помилка при відправці повідомлення. Спробуйте ще раз."
                );
            }
        }
    });
};
