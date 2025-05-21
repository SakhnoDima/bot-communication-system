const { roles } = require("../constants");
const User = require("../models/User");

module.exports = (bot) => {
  bot.callbackQuery("generate_invite", async (ctx) => {
    await ctx.answerCallbackQuery();

    await ctx.reply(
      "Введіть комагду /generate_invite та через пробіл псевдонім користувача.\nНаприклад: /generate_invite /Склад Київ"
    );
  });

  bot.command("generate_invite", async (ctx) => {
    const nickname = ctx.message.text.split("/")[2].trim();

    if (!nickname) {
      return ctx.reply("❗️ Формат: /generate_invite <псевдонім>");
    }

    const existing = await User.findOne({
      alias: nickname,
      role: roles.PROVIDER.name,
    });

    if (existing) {
      return ctx.reply(`⚠️ Склад із псевдонімом "${nickname}" вже існує.`);
    }

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const inviteLink = `https://t.me/@Manager_handler_bot?start=JOIN-${code}`;
    await ctx.reply(`✅ Інвайт для "${nickname}":\n${inviteLink}`);

    await User.create({
      role: roles.PROVIDER.name,
      alias: nickname,
      inviteCode: code,
    });
  });
};
