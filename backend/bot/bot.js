// bot/userBot.js
const { Telegraf, Markup } = require('telegraf');
const User = require('../models/User');
require('dotenv').config();

const userBot = new Telegraf(process.env.BOT_TOKEN);
const BASE_URL = "https://telegram-mini-shop-client.vercel.app/";

const tempUsers = new Map();

userBot.start(async ctx => {
    const chatId = ctx.from?.id?.toString();
    if (!chatId) return ctx.reply("❌ Chat ID topilmadi");

    const existingUser = await User.findOne({ chatId });
    if (existingUser) {
        return ctx.reply(`✅ Siz allaqachon ro‘yxatdan o‘tgansiz!`, Markup.inlineKeyboard([
            [Markup.button.webApp("🛍 Mini ilova", `${BASE_URL}?userId=${existingUser._id}`)]
        ]));
    }

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
    if (!temp) return;

    const phone = ctx.message.contact?.phone_number;
    if (!phone) return ctx.reply("❌ Kontakt topilmadi.");

    temp.phone = phone;
    temp.step = 'location';
    tempUsers.set(chatId, temp);

    return ctx.reply("📍 Iltimos, lokatsiyangizni yuboring:", Markup.keyboard([
        [Markup.button.locationRequest("📍 Lokatsiyani yuborish")]
    ]).resize());
});

userBot.on('location', async (ctx) => {
    const chatId = ctx.from?.id?.toString();
    const temp = tempUsers.get(chatId);
    if (!temp) return ctx.reply("❌ Vaqtinchalik maʼlumot topilmadi.");

    const location = ctx.message.location;
    if (!location) return ctx.reply("❌ Lokatsiya topilmadi.");

    try {
        const newUser = await User.create({
            chatId,
            name: temp.name,
            phone: temp.phone,
            location: {
                latitude: location.latitude,
                longitude: location.longitude
            }
        });

        tempUsers.delete(chatId);

        await ctx.reply("🎉 Ro‘yxatdan o‘tildi!", Markup.inlineKeyboard([
            [Markup.button.webApp("🛍 Mini ilova", `${BASE_URL}?userId=${newUser._id}`)]
        ]));
    } catch (e) {
        console.error("Saqlashda xatolik:", e.message);
        ctx.reply("❌ Ro‘yxatdan o‘tishda xatolik.");
    }
});

module.exports = { userBot };
