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
    CONTENT_MANAGER: {
        name: "Контент Менеджер",
    },
};
module.exports = {
    roles,
};
