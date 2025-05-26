const { Provider } = require("../models");

module.exports = (bot) => {
  bot.callbackQuery(/^message_to_provider:(.+)$/, async (ctx) => {
    const [telegramId, _id] = ctx.match[1].split("/");

    const providerFromDb = await Provider.findById(_id);

    await ctx.answerCallbackQuery();
    await ctx.conversation.enter("sendMessageToProviderConversation", {
      args: [telegramId, providerFromDb.alias, _id],
    });
  });
};
