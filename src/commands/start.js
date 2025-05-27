const User = require("../models/User");
const { roles } = require("../constants");
const { adminKeyboard, managerKeyboard } = require("../keyboards");

module.exports = (bot) => {
  bot.command("start", async (ctx) => {
    const { id: userTelegramId } = ctx.update.message.from;
    const args = ctx.message.text.split(" ");
    const payload = args[1];

    if (!ctx.from) {
      return ctx.reply(
        "❌ Помилка: не вдалося отримати інформацію про користувача."
      );
    }
    // console.log(userTelegramId);
    // console.log(ctx.update.message.from);

    // Check if the user is ADMIN
    if (userTelegramId === roles.ADMIN.id) {
      ctx.session.role = roles.ADMIN.name;
      return await ctx.reply("Виберіть команду:", {
        reply_markup: adminKeyboard,
      });
    }

    // User authentication
    if (payload && payload.startsWith("JOIN-")) {
      const inviteCode = payload.split("JOIN-")[1];

      try {
        const user = await User.findOne({
          $or: [{ telegramId: ctx.from.id.toString() }, { inviteCode }],
        });

        if (!user) {
          return ctx.reply("❌ Невірний інвайт-код.");
        }

        if (user.telegramId) {
          return ctx.reply(
            "❌ Цей користувач вже був зареєстрований. Зверніться до адміністратора."
          );
        }

        user.telegramId = ctx.from.id.toString();
        user.name = ctx.from.first_name || "Unknown User";
        user.isAuth = true;
        await user.save();

        ctx.session.role = user.role;

        ctx.reply(`🎉 Вітаю ${user.name}, ви успішно зареєстровані!`);

        if (user.role === roles.ADMIN) {
          return await ctx.reply("Виберіть команду:", {
            reply_markup: adminKeyboard,
          });
        }

        if (user.role === roles.PROVIDER) {
          return await ctx.reply(
            "Для контакту з менеджером, напишіть йому повідомлення."
          );
        }
      } catch (error) {
        console.log("User authentication error. Error:", error);
        return ctx.reply(
          "❌ Помилка при реєстрації. Спробуйте ще раз пізніше або зверніться до менеджера."
        );
      }
    }

    // Check user role
    try {
      const user = await User.findOne({ telegramId: ctx.from.id.toString() });

      if (!user) {
        return ctx.reply(
          "❌ Ви не зареєстровані. Зверніться до адміністратора для отримання інвайт-коду."
        );
      }

      if (user.role === roles.MANAGER.name) {
        ctx.session.role = roles.MANAGER.name;
        return await ctx.reply("Виберіть команду:", {
          reply_markup: managerKeyboard,
        });
      } else if (user.role === roles.PROVIDER.name) {
        ctx.session.role = roles.PROVIDER.name;
        return await ctx.reply(
          "Для контакту з менеджером, напишіть йому повідомлення."
        );
      } else {
        return ctx.reply("❌ Невідома роль користувача.");
      }
    } catch (error) {
      console.log("Check user role. Error:", error);
      return ctx.reply(
        "❌ Помилка. Спробуйте ще раз пізніше або зверніться до менеджера."
      );
    }
  });
};
