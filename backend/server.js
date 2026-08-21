const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGO_URL; 
if (!MONGO_URI) {
    console.error("❌ CẢNH BÁO: Chưa tìm thấy chuỗi kết nối MongoDB trong file .env! Hãy kiểm tra lại tên biến.");
}

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("Database MongoDB Atlas đã kết nối thành công!");
    })
    .catch((err) => {
        console.error("❌ Lỗi kết nối database: ", err);
    });

// Đường dẫn API đã được gom gọn lại, không bị lặp đè lên nhau nữa
app.use('/api/auth', require('./routes/auth'));
app.use('/api/food', require('./routes/food'));

app.get('/', (req, res) => {
    res.send('Server Food Rescue đang hoạt động mượt mà!');
});

async function autoCleanUp() {
    try {
        const Food = mongoose.models.Food || mongoose.model('Food');
        if (Food) {
            const today = new Date();
            const result = await Food.deleteMany({
                $or: [
                    { expiryDate: { $lt: today } },
                    { hanDung: { $lt: today } }
                ]
            });
            
            if (result.deletedCount > 0) {
                console.log(`[HỆ THỐNG] 🧹 Đã tự động dọn dẹp ${result.deletedCount} bài đăng hết hạn!`);
            }
        }
    } catch (error) {
        console.error("❌ Lỗi khi tự động dọn dẹp bài viết:", error);
    }
}
setInterval(autoCleanUp, 1800000);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại cổng: http://localhost:${PORT}`);
});