const { Telegraf, Markup } = require('telegraf');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const userBot = new Telegraf(process.env.BOT_TOKEN); // Foydalanuvchi bot
const adminBot = new Telegraf(process.env.ADMIN_BOT_TOKEN); // Kanalga yuborish bot
const BASE_URL = "https://telegram-mini-shop-client.vercel.app/";
// const BASE_URL = "https://272d-31-148-165-251.ngrok-free.app/";

const tempUsers = new Map();

userBot.start(async (ctx) => {
    const chatId = ctx.from?.id?.toString();
    if (!chatId) return ctx.reply("❌ Chat ID topilmadi");

    // 👨‍💻 Admin kirsa
    if (chatId === process.env.ADMIN_CHAT_ID)
        return ctx.reply("👋 Salom admin!", Markup.inlineKeyboard([
            [Markup.button.webApp("🧑‍💻 Kabinetga kirish", `${BASE_URL}category?chatId=${chatId}`)]
        ]));

    // ✅ Allaqachon ro‘yxatdan o‘tgan foydalanuvchi
    const existingUser = await User.findOne({ chatId });
    if (existingUser)
        return ctx.reply(`✅ Siz allaqachon ro‘yxatdan o‘tgansiz! ${existingUser._id}`, Markup.inlineKeyboard([
            [Markup.button.webApp("🛍 Mini ilova", `${BASE_URL}?userId=${existingUser._id}`)]
        ]));
    

    // 📝 Ro‘yxat jarayoni
    tempUsers.set(chatId, { step: 'name' });
    return ctx.reply("Ismingizni kiriting:");
});

userBot.on('text', async (ctx) => {
    const chatId = ctx.from?.id?.toString();
    const temp = tempUsers.get(chatId);
    if (!temp) return;

    if (temp.step === 'name') {
        temp.name = ctx.message.text;
        temp.step = 'phone';
        tempUsers.set(chatId, temp);

        return ctx.reply("📞 Kontakt yuboring:", Markup.keyboard([
            [Markup.button.contactRequest("📱 Kontakt yuborish")]
        ]).resize());
    }
});

userBot.on('contact', async (ctx) => {
    const chatId = ctx.from?.id?.toString();
    const temp = tempUsers.get(chatId);
    if (!temp) return ctx.reply("❌ Vaqtinchalik maʼlumot topilmadi.");

    const phone = ctx.message.contact?.phone_number;
    if (!phone || !chatId) return ctx.reply("❌ Kontakt yoki chat ID topilmadi.");

    try {
        const newUser = await User.create({ chatId, name: temp.name, phone });
        tempUsers.delete(chatId);

        return ctx.reply("🎉 Ro‘yxatdan o‘tildi!", Markup.inlineKeyboard([
            Markup.button.webApp("🛍 Mini ilova", `${BASE_URL}?userId=${newUser._id}`)
        ]));
    } catch (e) {
        console.error("Foydalanuvchini saqlashda xatolik:", e.message);
        return ctx.reply("❌ Ro‘yxatdan o‘tishda xatolik.");
    }
});

module.exports = { userBot, adminBot };
