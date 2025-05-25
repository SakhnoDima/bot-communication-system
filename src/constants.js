const roles = {
  ADMIN: {
    id: Number(process.env.ADMIN_ID),
    name: "Адмін",
  },
  MANAGER: {
    name: "Менеджер",
  },
  PROVIDER: {
    name: "Склад",
  },
};
module.exports = {
  roles,
};
