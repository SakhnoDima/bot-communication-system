const { InlineKeyboard } = require("grammy");

const adminKeyboard = new InlineKeyboard()
  .text("Згенерувати посилання", `generate_invite`)
  .row()
  .text("Список Складів", `providers_list`);

const managerKeyboard = new InlineKeyboard().text(
  "Список Складів",
  `providers_list`
);

const backToMenuKeyboard = new InlineKeyboard().text(
  "<< Назад в меню",
  "back_to_menu:admin"
);

module.exports = {
  adminKeyboard,
  managerKeyboard,
  backToMenuKeyboard,
};
