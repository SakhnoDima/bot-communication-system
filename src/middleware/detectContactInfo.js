const openai = require("openai");
require("dotenv").config();

const client = new openai({
  apiKey: process.env.OPENAI_API_KEY,
});

const ADMIN_ID = process.env.ADMIN_ID;

const detectContactInfo = async (messageText, userNameFrom, userNameTo) => {
  const bot = require("../bot");
  const patterns = [
    /https?:\/\/(t\.me|wa\.me|viber\.com|telegram\.me)\/[^\s]+/i,
    /(?:\+?\d{1,3}[ -]?)?(?:\(?\d{1,4}\)?[ -]?)?[\d -]{7,14}\d/,
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}\b/i,
    /@\w{3,}/,
  ];

  const nowFormatted = new Date().toLocaleString("uk-UA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  for (const pattern of patterns) {
    const match = messageText.match(pattern);
    if (match) {
      const digitsCount = match[0].replace(/\D/g, "").length;
      console.log("Знайдений збіг:", match[0]);
      console.log("Кількість цифр:", digitsCount);
      if (digitsCount <= 11) {
        await bot.api.sendMessage(
          ADMIN_ID,
          `⚠️ Повідомлення від: ${userNameFrom} до: ${userNameTo} містить контактну інформацію. \n\n Текст повідомлення: ${messageText}.\n\n Дата ${nowFormatted}`
        );

        return;
      } else {
        console.log("Занадто багато цифр — не телефон");
      }
    }
  }

  try {
    const response = await client.responses.create({
      model: "gpt-4o",
      instructions:
        "Чи містить наступний текст контактну інформацію (номер телефону, email, посилання на месенджер, username) або інші дані для зв’язку? Значення можуть бути приховані в контексті повідомлення. Відповідай 'yes' або 'no'.",
      input: messageText,
    });

    console.log("Використано токенів:", response.usage.total_tokens);

    const responseText = response.output_text.trim().toLowerCase();

    if (responseText === "yes") {
      console.log(`Запрос`);

      await bot.api.sendMessage(
        ADMIN_ID,
        `⚠️ Повідомлення від: ${userNameFrom} до: ${userNameTo} містить контактну інформацію. \n\n Текст повідомлення: ${messageText}.\n\n Дата ${nowFormatted} `
      );
      return;
    } else if (responseText === "no") {
      console.log("No contact info detected in message:", messageText);
      return;
    }
  } catch (error) {
    console.error("Error during contact info detection:", error);
    await bot.api.sendMessage(
      ADMIN_ID,
      `❗️ Помилка при перевірці повідомлення від: ${userNameFrom} до: ${userNameTo}. Текст повідомлення: ${messageText}. Перевірте ьаланс або зверніться до адміністратора.`
    );
    return;
  }
};

module.exports = detectContactInfo;
