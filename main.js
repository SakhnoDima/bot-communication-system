const { GrammyError, HttpError } = require("grammy");

const bot = require("./bot");
const { roles } = require("./constants");
const { roleMiddleware } = require("./middleware");

// bot.command("admin", roleMiddleware(roles.ADMIN), async (ctx) => {
//   await ctx.reply("Admin ✅");
// });

// bot.command("manager", roleMiddleware(roles.MANAGER), async (ctx) => {
//   await ctx.reply("Manager ✅");
// });

require("./commands/start")(bot);
require("./commands/generate_invite")(bot);

bot.on("message", async (ctx) => {
  console.log(ctx.session.role);

  ctx.reply("Привет! Я бот, который поможет вам с управлением ролями.");
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

bot.start();
