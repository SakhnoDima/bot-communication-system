module.exports = (bot) => {
  bot.callbackQuery("generate_invite", async (ctx) => {
    await ctx.answerCallbackQuery();

    await ctx.reply(
      "Введіть комагду /generate_invite та через пробіл псевдонім користувача.\nНаприклад: /generate_invite Склад Київ"
    );
  });

  bot.command("generate_invite", async (ctx) => {
    const args = ctx.message.text.split(" ").slice(1);
    const [nickname] = args;

    if (!nickname) {
      return ctx.reply("❗️ Формат: /generate_invite <псевдонім>");
    }

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const inviteLink = `https://t.me/@Manager_handler_bot?start=JOIN-${code}`;
    await ctx.reply(`✅ Інвайт для "${nickname}":\n${inviteLink}`);

    //TODO Додаємо новий склад в БД
  });
};
