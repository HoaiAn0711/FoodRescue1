require('dotenv').config(); // Đọc file .env
const mongoose = require('mongoose');
const User = require('./models/User'); 

// Tự động lấy URI từ .env, nếu không có sẽ lấy chuỗi mặc định
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'ĐIỀN_CHUỖI_MONGODB_ATLAS_TRONG_FILE_ENV_VÀO_ĐÂY';

async function createAdmin() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Đã kết nối Database thành công...');

        const adminEmail = 'admin@gmail.com';
        const adminPassword = '123';

        let user = await User.findOne({ email: adminEmail });

        if (user) {
            user.role = 'ADMIN';
            await user.save();
            console.log(`🎉 Tài khoản ${adminEmail} đã tồn tại! Đã nâng cấp thành quyền ADMIN.`);
        } else {
            user = new User({
                username: 'System Admin',
                email: adminEmail,
                password: adminPassword,
                role: 'ADMIN'
            });
            await user.save();
            console.log(`🎉 Đã tạo mới tài khoản ADMIN thành công!`);
            console.log(`👉 Email: ${adminEmail} | Mật khẩu: ${adminPassword}`);
        }

    } catch (error) {
        console.error('❌ Có lỗi xảy ra:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

createAdmin();