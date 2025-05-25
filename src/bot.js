const { Bot, session } = require("grammy");
const { hydrate } = require("@grammyjs/hydrate");
const {
  conversations,
  createConversation,
} = require("@grammyjs/conversations");
const {
  sendMessageToProviderConversation,
  generateInviteConversation,
} = require("./conversation");

require("dotenv").config();

const { BOT_API_KEY } = process.env;

if (!BOT_API_KEY) {
  throw new Error("BOT_API_KEY is not defined!");
}
const bot = new Bot(BOT_API_KEY);
bot.use(
  session({
    initial: () => ({ role: null, selectedProviderId: null }),
  })
);
bot.use(hydrate());
bot.use(conversations());
bot.use(createConversation(sendMessageToProviderConversation));
bot.use(createConversation(generateInviteConversation));
bot.api.setMyCommands([
  { command: "start", description: "Запустити бота, вибрати доступні команди" },
  {
    command: "help",
    description: "Інформація про бота.",
  },
]);

module.exports = bot;
