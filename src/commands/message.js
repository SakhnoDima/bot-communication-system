const { roles } = require("../constants");
const { detectContactInfo } = require("../middleware");
const Message = require("../models/Message");
const User = require("../models/User");

module.exports = (bot) => {
  bot.on("message", async (ctx) => {
    if (ctx.session.role === roles.PROVIDER.name) {
      const myId = ctx.update.message.from.id;
      console.log(myId);

      const myMessage = ctx.update.message.text;
      try {
        const myAccount = await User.findOne({
          telegramId: myId,
        });
        console.log("Me:", myAccount);

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

        detectContactInfo(myMessage).then((isMessageWithContactInfo) => {
          if (isMessageWithContactInfo) {
            const nowFormatted = new Date().toLocaleString("uk-UA", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            });
            bot.api.sendMessage(
              "770217773",
              `⚠️ Повідомлення від Cкладу: ${myAccount.alias} до Менеджера: ${myAccount.manager.name} містить контактну інформацію. \n\n Текст повідомлення: ${myMessage}\n\n Дата ${nowFormatted} `
            );
          }
        });

        // TODO тут відправляємо повідомлення на перевірку
      } catch (error) {
        console.log("Error saving message:", error);
        await ctx.reply(
          "❗️ Помилка при відправці повідомлення. Спробуйте ще раз."
        );
      }
    }
  });
};
