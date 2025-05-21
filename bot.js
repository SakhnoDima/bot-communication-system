const { Bot, session } = require("grammy");
require("dotenv").config();

const bot = new Bot(process.env.BOT_API_KEY);

bot.use(
  session({
    initial: () => ({ role: null }),
  })
);

bot.api.setMyCommands([
  { command: "start", description: "Запустити бота, вибрати доступні команди" },
]);

module.exports = bot;
