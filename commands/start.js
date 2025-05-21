const { InlineKeyboard } = require("grammy");
const User = require("../models/User");
const { roles } = require("../constants");

const keyboard = new InlineKeyboard()
  .text("Адмін", `select_role:${roles.ADMIN.name}`)
  .row()
  .text("Менеджер", `select_role:${roles.MANAGER.name}`)
  .row()
  .text("Склад", `select_role:${roles.PROVIDER.name}`);

module.exports = (bot) => {
  bot.command("start", async (ctx) => {
    const args = ctx.message.text.split(" ");
    const payload = args[1];

    if (payload && payload.startsWith("JOIN-")) {
      const inviteCode = payload.split("JOIN-")[1];

      const provider = await User.findOne({ inviteCode });

      if (!provider) {
        return ctx.reply("❌ Невірний інвайт-код.");
      }

      if (provider.isAuth) {
        return ctx.reply(
          "⚠️ Цей інвайт вже використано. Зверніться до адміністратора."
        );
      }
      provider.telegramId = ctx.from.id.toString();
      provider.name = ctx.from.first_name;
      provider.isAuth = true;
      await provider.save();

      ctx.session.role = roles.PROVIDER.name;

      return ctx.reply(`🎉 Ви зареєстровані!`);
    }

    await ctx.reply("Виберіть вашу роль:", {
      reply_markup: keyboard,
    });
  });

  bot.callbackQuery(/^select_role:(.+)$/, async (ctx) => {
    const userId = ctx.from.id;
    const selectedRole = ctx.match[1];

    await ctx.answerCallbackQuery();
    await ctx.reply(`✅ Ви ибрали роль: ${selectedRole}`);

    if (selectedRole === roles.ADMIN.name && userId === roles.ADMIN.id) {
      const adminKeyboard = new InlineKeyboard().text(
        "Згенерувати посилання",
        `generate_invite`
      );

      await ctx.reply("Виберіть команду:", {
        reply_markup: adminKeyboard,
      });
      ctx.session.role = selectedRole;
    } else if (
      selectedRole === roles.MANAGER.name &&
      userId === roles.MANAGER.id
    ) {
      await ctx.reply("Команди Менеджера:\n/view\n/reports");
      ctx.session.role = selectedRole;
    } else if (
      selectedRole === roles.PROVIDER.name &&
      userId !== roles.ADMIN.id &&
      userId !== roles.MANAGER.id
    ) {
      await ctx.reply("Команди Склад:\n/start\n/manage\n/stats");
      ctx.session.role = selectedRole;
    } else {
      await ctx.reply("У вас нет доступа. Пожалуйста, повторите попытку.");
    }
  });
};
