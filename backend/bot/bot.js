const { Telegraf } = require('telegraf');
const dotenv = require('dotenv');
dotenv.config();

const bot = new Telegraf(process.env.ADMIN_BOT_TOKEN); // .env da BOT_TOKEN va ADMIN_CHANNEL_ID bo'lishi kerak

module.exports = bot;
