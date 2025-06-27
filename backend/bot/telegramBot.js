const { Telegraf, Markup } = require('telegraf');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

const tempUsers = new Map(); // vaqtincha foydalanuvchilar

// 🔹 /start komandasi
bot.start(async (ctx) => {
    const chatId = ctx.from?.id?.toString();
    if (!chatId) return ctx.reply("❌ Xatolik: Chat ID aniqlanmadi.");

    // 🔸 Admin bo‘lsa
    if (chatId === process.env.ADMIN_CHAT_ID) {
        return ctx.reply("👋 Salom admin!", Markup.inlineKeyboard([
            [Markup.button.webApp("🧑‍💻 Kabinetga kirish", `https://telegram-mini-shop-client-7qi2.vercel.app/category?chatId=${chatId}`)]
        ]).resize());
    }

    // 🔸 Oddiy foydalanuvchi bazada bormi?
    const existingUser = await User.findOne({ chatId });
    if (existingUser) {
        return ctx.reply("🎉 Siz allaqachon ro‘yxatdan o‘tgansiz!", Markup.inlineKeyboard([
            [Markup.button.webApp("🛍 Mini ilovani ochish", `https://telegram-mini-shop-client-7qi2.vercel.app/?chatId=${chatId}`)]
        ]));
    }

    // 🔸 Ro‘yxatdan o‘tmagan bo‘lsa – ismni so‘rash
    tempUsers.set(chatId, { step: 'name' });
    return ctx.reply("Ismingizni kiriting:");
});

// 🔹 Matnli javob (ism qabul qilish)
bot.on('text', async (ctx) => {
    const chatId = ctx.from?.id?.toString();
    const temp = tempUsers.get(chatId);
    if (!temp) return;

    if (temp.step === 'name') {
        temp.name = ctx.message.text;
        temp.step = 'phone';
        tempUsers.set(chatId, temp);

        return ctx.reply("📞 Iltimos, telefon raqamingizni kontakt sifatida yuboring:", Markup.keyboard([
            [Markup.button.contactRequest("📱 Kontakt yuborish")]
        ]).resize());
    }
});

// 🔹 Kontakt yuborilganda
bot.on('contact', async (ctx) => {
    const chatId = ctx.from?.id?.toString();
    const temp = tempUsers.get(chatId);
    if (!temp) return ctx.reply("❌ Xatolik: vaqtincha ma’lumot topilmadi.");

    const phone = ctx.message.contact?.phone_number;

    // ❗ Agar telefon yoki chatId yo‘q bo‘lsa – xatolik
    if (!phone || !chatId) {
        return ctx.reply("❌ Telefon raqam yoki chat ID topilmadi.");
    }

    try {
        // 🔸 Foydalanuvchini bazaga yozamiz
        await User.create({
            chatId,
            name: temp.name,
            phone,
        });

        // 🔸 Vaqtinchalik foydalanuvchini o‘chiramiz
        tempUsers.delete(chatId);

        return ctx.reply("🎉 Ro‘yxatdan o‘tildi!", Markup.inlineKeyboard([
            [Markup.button.webApp("🛍 Mini ilovani ochish", `https://telegram-mini-shop-client-7qi2.vercel.app/?chatId=${chatId}`)]
        ]));
    } catch (e) {
        console.error("❌ Foydalanuvchini saqlashda xatolik:", e.message);
        return ctx.reply("❌ Ro‘yxatdan o‘tishda xatolik yuz berdi.");
    }
});

module.exports = bot;
