const { InlineKeyboard } = require("grammy");
const { roles } = require("../constants");

const User = require("../models/User");

module.exports = (bot) => {
    bot.callbackQuery("content_manager", async (ctx) => {
        const ContentManagerKeyboard = new InlineKeyboard();

        const contentManager = await User.findOne({
            isAuth: true,
            role: roles.CONTENT_MANAGER.name,
        });
        if (!contentManager) {
            return ctx.reply(
                `Дані про контент менеджера відсутні. Зверніться до адміністратора.`
            );
        }

        ContentManagerKeyboard.text(
            "Відправити повідомлення",
            `message_to_content_manager:${contentManager.telegramId}/${contentManager._id}`
        )
            .row()
            .text(
                "Всі повідомлення",
                `all_messages_from_db:${contentManager.telegramId}`
            )
            .row()
            .text("<< Назад в меню", `back_to_menu:manager`);

        await ctx.callbackQuery.message?.editText(
            `Виберіть дію для ${contentManager.alias} контент менеджер:`,
            {
                reply_markup: ContentManagerKeyboard,
            }
        );
    });
};
