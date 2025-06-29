const Message = require("../models/Message");

module.exports = (bot) => {
    bot.callbackQuery(/^all_messages_from_db:(.+)$/, async (ctx) => {
        const providerId = ctx.match[1];

        await ctx.answerCallbackQuery();

        const now = new Date();

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const threeWeeksAgo = new Date(
            now.getTime() - 21 * 24 * 60 * 60 * 1000
        );

        console.log("startOfMonth:", threeWeeksAgo);

        const messagesFroDb = await Message.find({
            $and: [
                {
                    $or: [
                        { "from.telegramId": providerId },
                        { "to.telegramId": providerId },
                    ],
                },
                {
                    createdAt: {
                        $gte: threeWeeksAgo,
                    },
                },
            ],
        }).sort({ createdAt: -1 });

        if (messagesFroDb.length === 0) {
            await ctx.reply(
                "❗️ Немає повідомлень від складу за останні 3 тижні."
            );
            return;
        }

        const messagesText = messagesFroDb
            .map((msg) => {
                return `*From: ${msg.from.name}* - *To: ${msg.to.name}*\n${
                    msg.text
                }\n*Date:* ${msg.createdAt.toLocaleString()}`;
            })
            .join("\n\n");

        await ctx.reply(
            `📩 Повідомлення за поточний місяць:\n\n${messagesText}`,
            {
                parse_mode: "Markdown",
            }
        );
    });
};
