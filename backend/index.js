const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const { userBot } = require('./bot/bot');

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
userBot.launch().then(() => console.log("Telegram bot ishga tushdi ✅"));

// Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server ${PORT}-portda ishlayapti`);
});

const categoryRoutes = require('./routes/categoryRoutes');
app.use('/api/v1/categories', categoryRoutes);

const productRoutes = require('./routes/productRoutes');
app.use('/api/v1/products', productRoutes);

const basketRoutes = require('./routes/basketRoutes');
app.use('/api/v1/basket', basketRoutes);

const orderRoutes = require('./routes/orderRoutes');
app.use('/api/v1/order', orderRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/v1/user', userRoutes);
