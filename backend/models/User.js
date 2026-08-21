const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // Đã bỏ 'required: true' để không bị lỗi khi form chưa có ô nhập tên 
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['NGƯỜI NHẬN', 'NGƯỜI TẶNG', 'ADMIN'], 
        default: 'NGƯỜI TẶNG' // Nên để mặc định là người tặng hoặc người nhận tùy bạn
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);