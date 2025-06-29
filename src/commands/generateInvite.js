module.exports = (bot) => {
    bot.callbackQuery("generate_invite", async (ctx) => {
        await ctx.answerCallbackQuery();
        console.log("Generating invite...");

        await ctx.conversation.enter("generateInviteConversation");
    });
};
