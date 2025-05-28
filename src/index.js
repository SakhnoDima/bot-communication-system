const mongoose = require("mongoose");
require("dotenv").config();
const { GrammyError, HttpError } = require("grammy");

const bot = require("./bot");

require("./commands/start")(bot);
require("./commands/help")(bot);

require("./commands/generateInvite")(bot);
require("./commands/providersList")(bot);
require("./commands/providerActions")(bot);
require("./commands/messageToProvider")(bot);
require("./commands/allMessagesFromProvider")(bot);
require("./commands/allMessagesFile")(bot);
require("./commands/backToMenu")(bot);

require("./commands/message")(bot);

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

const startBot = async () => {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URIis not defined!");
  }

  try {
    await mongoose
      .connect(MONGODB_URI)
      .then(() => {
        console.log("✅ MongoDB connected!");
      })
      .catch(console.error);

    await bot.start();
    console.log("✅ Bot started!");
  } catch (error) {
    console.error("Error in  startBot:", error);
  }
};

startBot();
