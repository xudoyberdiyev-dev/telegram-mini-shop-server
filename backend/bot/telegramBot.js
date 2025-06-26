const { Telegraf, Markup } = require('telegraf');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

const tempUsers = new Map(); // vaqtincha ismni saqlash

// 🔹 /start komandasi
bot.start(async (ctx) => {
    const telegramId = ctx.from.id.toString();

    // 1. ADMIN tekshirish
    if (telegramId === process.env.ADMIN_CHAT_ID) {
        return ctx.reply("👋 Salom admin!", Markup.inlineKeyboard([
            [Markup.button.webApp("🧑‍💻 Kabinetga kirish", "https://your-admin-app-url.com")]
        ]).resize());
    }

    // 2. Oddiy foydalanuvchi bazada bormi?
    const user = await User.findOne({ telegramId });
    if (user) {
        return ctx.reply("✅ Ro‘yxatdan o‘tgansiz!", Markup.inlineKeyboard([
            [Markup.button.webApp("🛍 Mini ilovani ochish", "https://your-miniapp-url.com")]
        ]).resize());
    }

    // 3. Ro‘yxatdan o‘tmaganlar uchun ism so‘rash
    tempUsers.set(telegramId, { step: 'name' });
    ctx.reply("Ismingizni kiriting:");
});

// 🔹 Matnli javob: ismi yoki raqam bosqichi
bot.on('text', async (ctx) => {
    const telegramId = ctx.from.id.toString();
    const temp = tempUsers.get(telegramId);

    if (!temp) return;

    // 1. Ism bosqichi
    if (temp.step === 'name') {
        temp.name = ctx.message.text;
        temp.step = 'phone';
        tempUsers.set(telegramId, temp);

        return ctx.reply("📞 Iltimos, telefon raqamingizni kontakt sifatida yuboring:", Markup.keyboard([
            [Markup.button.contactRequest("📱 Kontakt yuborish")]
        ]).resize());
    }
});

// 🔹 Kontakt yuborilganda
bot.on('contact', async (ctx) => {
    const telegramId = ctx.from.id.toString();
    const temp = tempUsers.get(telegramId);

    if (!temp) return;

    // 2. Foydalanuvchini saqlash
    const phone = ctx.message.contact.phone_number;

    await User.create({
        telegramId,
        name: temp.name,
        phone
    });

    tempUsers.delete(telegramId);

    return ctx.reply("🎉 Ro‘yxatdan o‘tildi!", Markup.inlineKeyboard([
        [Markup.button.webApp("🛍 Mini ilovani ochish", "https://your-miniapp-url.com")]
    ]).resize());
});

module.exports = bot;
