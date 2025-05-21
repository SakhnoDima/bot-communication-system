const roles = {
  ADMIN: {
    id: Number(process.env.ADMIN_ID),
    name: "Адмін",
  },
  MANAGER: {
    id: Number(process.env.MANAGER_ID),
    name: "Менеджер",
  },
  PROVIDER: {
    name: "Склад",
  },
};
module.exports = {
  roles,
};
