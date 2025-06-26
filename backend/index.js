const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bot = require('./bot/telegramBot');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());



// MongoDB ulash
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("✅ MongoDB ulandi"))
    .catch(err => console.error("❌ MongoDB xato:", err));

// Test route
app.get('/', (req, res) => {
    res.send("🚀 Bot backend ishlayapti");
});

// Botni ishga tushurish
bot.launch();
console.log("🤖 Telegram bot ishga tushdi");

// Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server ${PORT}-portda ishlayapti`);
});

const categoryRoutes = require('./routes/categoryRoutes');
app.use('/api/categories', categoryRoutes);
