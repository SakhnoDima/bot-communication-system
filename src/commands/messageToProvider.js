module.exports = (bot) => {
  bot.callbackQuery(/^message_to_provider:(.+)$/, async (ctx) => {
    const provider = ctx.match[1];

    // ctx.session.selectedProviderId = provider.telegramId; // сесія selectedProviderId

    await ctx.answerCallbackQuery();
    await ctx.conversation.enter("sendMessageToProviderConversation", {
      args: [
        provider.split("/")[0],
        provider.split("/")[1],
        provider.split("/")[2],
      ],
    });
  });
};
