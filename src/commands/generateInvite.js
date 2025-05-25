const { roles } = require("../constants");
const { backToMenuKeyboard } = require("../keyboards");
const { isAuth } = require("../middleware");
const User = require("../models/User");

module.exports = (bot) => {
  bot.callbackQuery("generate_invite", async (ctx) => {
    await ctx.answerCallbackQuery();
    console.log("Generating invite...");

    await ctx.conversation.enter("generateInviteConversation");
    console.log("Finish generate");

    // await ctx.callbackQuery.message?.editText(
    //   `Для генерації посилання введіть наступну команду в повідомленні:\n /generate_invite, через пробіл роль користувача(${roles.MANAGER.name} або ${roles.PROVIDER.name}) а потім псевдонім користувача.\nНаприклад:\n /generate_invite /Склад /Склад Київ`,
    //   {
    //     reply_markup: backToMenuKeyboard,
    //   }
    // );
  });

  // bot.command("generate_invite", isAuth(), async (ctx) => {
  //   const [, , rawRole, rawNickname] = ctx.message.text.split("/");
  //   const role = rawRole?.trim();
  //   const nickname = rawNickname?.trim();
  //   console.log(`Role: ${role}, Nickname: ${nickname}`);

  //   if (role !== roles.MANAGER.name && role !== roles.PROVIDER.name) {
  //     return ctx.reply(
  //       `❗️ Неправильна роль. Доступні ролі: ${roles.MANAGER.name} або ${roles.PROVIDER.name}`
  //     );
  //   }

  //   // Check if nickname and role are provided
  //   if (!nickname || !role) {
  //     return ctx.reply("❗️ Формат: /generate_invite /<роль> /<псевдонім>");
  //   }

  //   let MANAGER = null;
  //   if (role === roles.PROVIDER.name) {
  //     const manager = await User.findOne({ role: roles.MANAGER.name });

  //     if (!manager || !manager.telegramId) {
  //       return ctx.reply("❗️ Спочатку додайте менеджера!");
  //     }
  //     MANAGER = manager;
  //   }

  //   const existing = await User.findOne({
  //     alias: nickname,
  //   });

  //   if (existing) {
  //     return ctx.reply(`⚠️ Користувач із псевдонімом "${nickname}" вже існує.`);
  //   }

  //   const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  //   await ctx.reply(
  //     `✅ Інвайт для *${nickname}*:\n\`\`\`\nhttps://t.me/@Manager_handler_bot?start=JOIN-${code}\n\`\`\``,
  //     { parse_mode: "Markdown" }
  //   );

  //   await User.create({
  //     role,
  //     alias: nickname,
  //     inviteCode: code,
  //     isAuth: false,
  //     managerId: role === roles.PROVIDER.name ? MANAGER.telegramId : null,
  //     managerName: role === roles.PROVIDER.name ? MANAGER.alias : null,
  //   });
  // });
};
