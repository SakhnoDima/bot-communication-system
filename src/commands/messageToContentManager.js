const { ContentManager } = require("../models");

module.exports = (bot) => {
    bot.callbackQuery(/^message_to_content_manager:(.+)$/, async (ctx) => {
        const [telegramId, _id] = ctx.match[1].split("/");

        const contentFromDb = await ContentManager.findById(_id);

        await ctx.answerCallbackQuery();
        await ctx.conversation.enter("sendMessageToProviderConversation", {
            args: [telegramId, contentFromDb.alias, _id, true],
        });
    });
};
