const { roles } = require("../constants");
const { InlineKeyboard } = require("grammy");
const { Manager, Provider, User, ContentManager } = require("../models");

const isCancel = (ctx, expected) => {
    return ctx?.callbackQuery?.data === expected;
};

const cancelConversation = async (
    ctx,
    chatId,
    messageId,
    msg = "⚠️ Генерація скасована."
) => {
    await ctx.answerCallbackQuery();
    await ctx.api.editMessageText(chatId, messageId, msg, {
        parse_mode: "Markdown",
    });
};

const extractData = (ctx, prefix) => {
    return ctx.callbackQuery.data.replace(`${prefix}:`, "").trim();
};

const askRole = async (conversation, ctx) => {
    const keyboard = new InlineKeyboard()
        .text(roles.MANAGER.name, `role:${roles.MANAGER.name}`)
        .text(roles.PROVIDER.name, `role:${roles.PROVIDER.name}`)
        .text(roles.CONTENT_MANAGER.name, `role:${roles.CONTENT_MANAGER.name}`)
        .row()
        .text("❌ Скасувати", "cancel_conversation");

    const msg = await ctx.reply("👤 Оберіть роль нового користувача:", {
        reply_markup: keyboard,
    });
    const messageId = msg.message_id;

    const roleCtx = await conversation.waitFor(
        "callback_query:data",
        (ctx) =>
            ctx.callbackQuery.data.startsWith("role:") ||
            isCancel(ctx, "cancel_conversation")
    );

    if (isCancel(roleCtx, "cancel_conversation")) {
        await cancelConversation(roleCtx, ctx.chat.id, messageId);
        return null;
    }

    await roleCtx.answerCallbackQuery();
    return { role: extractData(roleCtx, "role"), messageId };
};

const askNickname = async (conversation, ctx, messageId, role) => {
    const keyboard = new InlineKeyboard().text(
        "❌ Скасувати",
        "cancel_conversation_second_step"
    );

    await ctx.api.editMessageText(
        ctx.chat.id,
        messageId,
        `✏️ Ви вибрали *${role}*. Введіть псевдонім:`,
        { reply_markup: keyboard, parse_mode: "Markdown" }
    );

    const nicknameCtx = await conversation.wait();

    if (isCancel(nicknameCtx, "cancel_conversation_second_step")) {
        await cancelConversation(nicknameCtx, ctx.chat.id, messageId);
        return null;
    }

    const nickname = nicknameCtx.message?.text?.trim();
    if (!nickname) {
        await ctx.api.editMessageText(
            ctx.chat.id,
            messageId,
            "⚠️ Очікувалося текстове повідомлення."
        );
        return null;
    }

    return nickname;
};

const askManager = async (conversation, ctx, messageId, nickname) => {
    const managers = await Manager.find({
        telegramId: { $ne: null },
    });

    if (managers.length === 0) {
        await ctx.api.editMessageText(
            ctx.chat.id,
            messageId,
            "❗️ Спочатку додайте менеджера."
        );
        return null;
    }

    const keyboard = new InlineKeyboard();
    managers.forEach((m) =>
        keyboard.text(m.alias, `managers_list:${m.telegramId}`).row()
    );
    keyboard.text("❌ Скасувати", "cancel_conversation_managers");

    await ctx.api.editMessageText(
        ctx.chat.id,
        messageId,
        `👥 Виберіть менеджера для користувача *${nickname}*`,
        { reply_markup: keyboard, parse_mode: "Markdown" }
    );

    const managerCtx = await conversation.waitFor(
        "callback_query:data",
        (ctx) =>
            ctx.callbackQuery.data.startsWith("managers_list:") ||
            isCancel(ctx, "cancel_conversation_managers")
    );

    if (isCancel(managerCtx, "cancel_conversation_managers")) {
        await cancelConversation(managerCtx, ctx.chat.id, messageId);
        return null;
    }

    await managerCtx.answerCallbackQuery();

    const telegramId = extractData(managerCtx, "managers_list");
    return managers.find((m) => m.telegramId === telegramId);
};

const generateInviteConversation = async (conversation, ctx) => {
    const roleStep = await askRole(conversation, ctx);
    if (!roleStep) return;

    const { role, messageId } = roleStep;

    const nickname = await askNickname(conversation, ctx, messageId, role);
    if (!nickname) return;

    const exists = await User.findOne({ alias: nickname });
    if (exists)
        return await ctx.reply(
            `⚠️ Користувач з псевдонімом "${nickname}" вже існує.`
        );

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    if (role === roles.PROVIDER.name || role === roles.CONTENT_MANAGER.name) {
        const manager = await askManager(
            conversation,
            ctx,
            messageId,
            nickname
        );
        if (!manager) return;

        if (role === roles.PROVIDER.name) {
            await Provider.create({
                alias: nickname,
                inviteCode: code,
                manager: {
                    id: manager._id,
                    name: manager.alias,
                    telegramId: manager.telegramId,
                },
            });
        } else {
            await ContentManager.create({
                alias: nickname,
                inviteCode: code,
                manager: {
                    id: manager._id,
                    name: manager.alias,
                    telegramId: manager.telegramId,
                },
            });
        }
    } else {
        await Manager.create({
            alias: nickname,
            inviteCode: code,
            isAuth: false,
        });
    }

    await ctx.api.editMessageText(
        ctx.chat.id,
        messageId,
        `Користувача *${nickname}* створено з роллю *${role}*.`,
        { parse_mode: "Markdown" }
    );

    await ctx.reply(
        `✅ Відправте цей інвайт *${nickname}*:\nhttps://t.me/TdpetrovskiyBot?start=JOIN-${code}`
        //`✅ Відправте цей інвайт *${nickname}*:\nhttps://t.me/Manager_handler_bot?start=JOIN-${code}`
    );
};

module.exports = generateInviteConversation;
