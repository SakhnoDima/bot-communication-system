const { roles } = require("../constants");
const { InlineKeyboard } = require("grammy");
const User = require("../models/User");
const { Manager, Provider } = require("../models");

const generateInviteConversation = async (conversation, ctx, args) => {
  let messageId = null;
  // 1. Запитуємо роль
  const roleKeyboard = new InlineKeyboard()
    .text(roles.MANAGER.name, `role:${roles.MANAGER.name}`)
    .text(roles.PROVIDER.name, `role:${roles.PROVIDER.name}`)
    .row()
    .text("❌ Скасувати", "cancel_conversation");

  const message = await ctx.reply("👤 Оберіть роль нового користувача:", {
    reply_markup: roleKeyboard,
  });
  messageId = message.message_id;

  const roleCtx = await conversation.waitFor(
    "callback_query:data",
    (ctx) =>
      ctx.callbackQuery.data.startsWith("role:") ||
      ctx.callbackQuery.data === "cancel_conversation"
  );

  if (roleCtx.callbackQuery.data === "cancel_conversation") {
    await roleCtx.answerCallbackQuery();
    await ctx.api.editMessageText(
      ctx.chat.id,
      messageId,
      `⚠️ Генерація посилання скасована.`,
      { parse_mode: "Markdown" }
    );
    return;
  }
  await roleCtx.answerCallbackQuery();
  const role = roleCtx.callbackQuery.data.split(":")[1];

  // 2. Запитуємо псевдонім

  const nameKeyboard = new InlineKeyboard().text(
    "❌ Скасувати",
    "cancel_conversation_second_step"
  );

  await ctx.api.editMessageText(
    ctx.chat.id,
    messageId,
    `✏️ Ви вибрали *${role}*. Введіть псевдонім:`,
    {
      reply_markup: nameKeyboard,
    }
  );

  const nicknameStep = await conversation.wait();

  if (nicknameStep?.callbackQuery?.data === "cancel_conversation_second_step") {
    await nicknameStep.answerCallbackQuery();
    await ctx.api.editMessageText(
      ctx.chat.id,
      messageId,
      `⚠️ Генерація посилання скасована.`,
      { parse_mode: "Markdown" }
    );
    return;
  }

  if (!nicknameStep.message?.text) {
    return await ctx.reply("⚠️ Очікувалося текстове повідомлення.");
  }

  const nickname = nicknameStep.message.text.trim();

  // 3. Валідація
  if (role !== roles.MANAGER.name && role !== roles.PROVIDER.name) {
    return await ctx.reply("❗️ Неправильна роль.");
  }

  const existing = await User.findOne({ alias: nickname });
  if (existing) {
    return await ctx.reply(
      `⚠️ Користувач з псевдонімом "${nickname}" вже існує.`
    );
  }

  // 4. Генерація інвайта
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  // 5.Створюємо користувача задежно від ролі

  if (role === roles.PROVIDER.name) {
    const managers = await User.find({
      role: roles.MANAGER.name,
      telegramId: { $ne: null },
    });
    if (managers.length === 0) {
      return await ctx.reply("❗️ Спочатку додайте менеджера.");
    }

    const managersKeyboard = new InlineKeyboard();

    managers.forEach((manager) => {
      managersKeyboard.text(
        manager.alias,
        `managers_list:${manager._id}/${manager.alias}/${manager.telegramId}`
      );
      managersKeyboard.row();
    });

    managersKeyboard.text("❌ Скасувати", "cancel_conversation_managers");
    await ctx.api.editMessageText(
      ctx.chat.id,
      messageId,
      `👥 Виберіть менеджера для користувача *${nickname}* `,
      {
        reply_markup: managersKeyboard,
      }
    );

    const managerCtx = await conversation.waitFor(
      "callback_query:data",
      (ctx) =>
        ctx.callbackQuery.data.startsWith("managers_list:") ||
        ctx.callbackQuery.data === "cancel_conversation_managers"
    );

    if (managerCtx.callbackQuery.data === "cancel_conversation_managers") {
      await managerCtx.answerCallbackQuery();
      await ctx.api.editMessageText(
        ctx.chat.id,
        messageId,
        `⚠️ Генерація посилання скасована.`,
        { parse_mode: "Markdown" }
      );
      return;
    }

    await managerCtx.answerCallbackQuery();

    const data = managerCtx.callbackQuery.data.replace("managers_list:", "");
    const [managerId, managerAlias, managerTelegramId] = data.split("/");

    await Provider.create({
      alias: nickname,
      inviteCode: code,
      manager: {
        id: managerId,
        name: managerAlias,
        telegramId: managerTelegramId,
      },
    });
  } else {
    await Manager.create({
      alias: nickname,
      inviteCode: code,
      isAuth: false,
    });
  }

  // 6. Створення користувача

  await ctx.api.editMessageText(
    ctx.chat.id,
    messageId,
    `Користувача *${nickname}* створено з роллю *${role}*.`,
    { parse_mode: "Markdown" }
  );

  await ctx.reply(
    `✅ Відправте цей інвайт *${nickname}*:\n\`\`\`\nhttps://t.me/@Manager_handler_bot?start=JOIN-${code}\n\`\`\``,
    { parse_mode: "Markdown" }
  );
};

module.exports = generateInviteConversation;
