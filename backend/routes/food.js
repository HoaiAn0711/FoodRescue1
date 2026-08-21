const express = require('express');
const router = express.Router();
const Food = require('../models/Food');

// Cập nhật thông tin món
router.put('/:id', async (req, res) => {
    try {
        const updatedFood = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedFood);
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật" });
    }
});

// Lấy tất cả bài đăng
router.get('/', async (req, res) => {
    try {
        const foods = await Food.find().sort({ createdAt: -1 });
        res.json(foods);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

// Đăng bài mới (Đã tích hợp tự động tạo ảnh)
router.post('/', async (req, res) => {
    try {
        // Tạo một bản sao dữ liệu gửi lên
        let foodData = { ...req.body };

        // Kiểm tra nếu người dùng không đính kèm ảnh
       if (!foodData.image || foodData.image.trim() === '' || foodData.image === 'null' || foodData.image === 'undefined') {
            // Lấy tên món ăn từ trường 'title'
            const searchKeyword = foodData.title || 'food';
            
            // Tự động gán link ảnh ngẫu nhiên dựa trên tên món ăn
            foodData.image = `https://loremflickr.com/400/300/food,meal,${encodeURIComponent(searchKeyword)}`;
        }

        const newFood = new Food(foodData);
        await newFood.save();
        res.status(201).json(newFood);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi tạo bài đăng" });
    }
});

// Xóa bài
router.delete('/:id', async (req, res) => {
    try {
        await Food.findByIdAndDelete(req.params.id);
        res.json({ message: "Đã xóa" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi xóa" });
    }
});

module.exports = router;