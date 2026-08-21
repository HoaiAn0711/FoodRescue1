const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Đảm bảo bạn đang link đúng tới file Model User

// API Đăng nhập: POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Tìm User trong DB
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Sai email hoặc mật khẩu" });
        }

        // Kiểm tra xem tài khoản có bị Admin khóa không (Trạng thái Disabled)
        if (user.status === 'Disabled') {
            return res.status(403).json({ message: "Tài khoản của bạn đã bị vi phạm và bị khóa." });
        }

        // So sánh mật khẩu (Nếu bạn đang mã hóa bằng bcrypt, hãy dùng bcrypt.compare nhé)
        const isMatch = (password === user.password); 

        if (!isMatch) {
            return res.status(400).json({ message: "Sai email hoặc mật khẩu" });
        }

        // Đăng nhập thành công -> Trả về role của Database cho Frontend
        res.status(200).json({
            message: "Đăng nhập thành công",
            user: {
                email: user.email,
                role: user.role // Quan trọng: Truyền role thực tế (ADMIN/NGƯỜI NHẬN/NGƯỜI TẶNG) về Frontend
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// API Đăng ký tài khoản
// API Đăng ký tài khoản
router.post('/register', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        
        // Kiểm tra xem email đã tồn tại chưa
        const User = require('../models/User');
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email này đã được sử dụng!" });
        }

        // Chuẩn hóa role từ Frontend gửi lên để khớp với Database
        let standardizedRole = 'NGƯỜI TẶNG'; // Mặc định
        if (role) {
            // Kiểm tra nếu role chứa chữ 'nhận' (không phân biệt hoa thường)
            if (role.toLowerCase().includes('nhận')) {
                standardizedRole = 'NGƯỜI NHẬN';
            } 
            // Nếu có các role khác (như admin) thì bạn có thể thêm logic ở đây
        }

        // Tạo tài khoản mới
        const newUser = new User({ 
            email, 
            password, 
            role: standardizedRole, 
            status: 'Active' 
        });
        
        await newUser.save();
        res.status(201).json({ message: "Đăng ký thành công!" });

    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        res.status(500).json({ message: "Lỗi Server trong quá trình đăng ký" });
    }
});
router.get('/users', async (req, res) => {
    try {
        const User = require('../models/User');
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server" });
    }
});
// Bạn có thể giữ nguyên các API đăng ký (register) hiện tại của bạn ở dưới này...
// router.post('/register', ...)

module.exports = router;